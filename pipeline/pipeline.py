from ehr.ehr_reader import EHRReader
from ehr.ehr_navigator import EHRNavigator
from models.bayes_builder import BayesNetBuilder
from parsing.student_parser import StudentInputParser
from evaluation.diagnosis_evaluator import DiagnosisEvaluator
from agents.ai_attending import AIAttending
from pipeline.state import ConversationState
from medgemma_client import query_medgemma


def build_medgemma_prompt(findings, bayes_summary) -> str:
    """
    MedGemma prompt: turn Bayes net output into a short clinical teaching brief.
    Keep it structured so OpenAI can consume it.
    """
    return f"""
You are MedGemma. Create a concise, structured teaching brief using ONLY the provided information.
Do NOT invent patient facts. If something is missing, say it is missing.

EHR_FINDINGS:
{findings}

BAYES_NET_SUMMARY (ground truth):
{bayes_summary}

Return:
1) One-liner summary (1 sentence).
2) Top 3 diagnoses from Bayes summary with 1 supporting clue each.
3) 3 key missing discriminating questions.
4) 3 next best tests.
5) 2 short teaching pearls.

Answer:
""".strip()


class ClinicalTutoringPipeline:
    def __init__(self):
        ehr_data = EHRReader().load_case()
        self.findings = EHRNavigator().extract_findings(ehr_data)

        self.bayes_net = BayesNetBuilder().build_from_findings(self.findings)

        self.state = ConversationState()
        self.parser = StudentInputParser()
        self.diagnosis_eval = DiagnosisEvaluator()
        self.attending = AIAttending()

        # Build grounding ONCE per case
        self.state.bayes_summary = self.bayes_net.to_summary(k=5)
        medgemma_prompt = build_medgemma_prompt(self.findings, self.state.bayes_summary)
        self.state.medgemma_packet = query_medgemma(medgemma_prompt)

    def start(self) -> str:
        return self.attending.initial_message(
            ehr_findings=self.findings,
            bayes_summary=self.state.bayes_summary,
            medgemma_packet=self.state.medgemma_packet,
        )

    def step(self, student_input: str) -> str:
        parsed = self.parser.parse(student_input)
        self.state.student_diagnosis = parsed["diagnosis"]

        # Track symptoms across turns
        for s in parsed.get("symptoms", []):
            if s not in self.state.symptoms_identified:
                self.state.symptoms_identified.append(s)

        supported = False
        if self.state.student_diagnosis is not None:
            supported = self.diagnosis_eval.is_supported(self.bayes_net, self.state.student_diagnosis)

        self.state.turn_number += 1

        return self.attending.respond(
            self.state,
            ehr_findings=self.findings,
            student_input=student_input,
            diagnosis_supported=supported
        )