from ehr.ehr_reader import EHRReader
from ehr.ehr_navigator import EHRNavigator
from models.bayes_builder import BayesNetBuilder
from parsing.student_parser import StudentInputParser
from evaluation.diagnosis_evaluator import DiagnosisEvaluator
from agents.ai_attending import AIAttending
from pipeline.state import ConversationState
from models.medgemma_client import MedGemmaClient


class ClinicalTutoringPipeline:
    def __init__(self):
        ehr_data = EHRReader().load_case()
        findings = EHRNavigator().extract_findings(ehr_data)

        self.bayes_net = BayesNetBuilder().build_from_findings(findings)

        self.state = ConversationState()
        self.parser = StudentInputParser()
        self.diagnosis_eval = DiagnosisEvaluator()

        # NEW: MedGemma client + attending
        self.llm = MedGemmaClient()
        self.attending = AIAttending(self.llm)

        self.ehr_data = ehr_data
        self.findings = findings

        # A short EHR summary string for the attending prompt
        self.ehr_summary = self._make_ehr_summary(ehr_data, findings)

    def _make_ehr_summary(self, ehr_data, findings):
        title = ehr_data.get("title", "Case")
        age = ehr_data.get("demographics", {}).get("age", "?")
        sex = ehr_data.get("demographics", {}).get("sex", "?")
        key = ", ".join(findings[:18]) if findings else "No findings extracted"
        return f"{title} | {age} {sex}. Key extracted findings: {key}"

    def step(self, student_input: str) -> str:
        parsed = self.parser.parse(student_input)

        dx = parsed.get("diagnosis")
        supported = False
        if dx:
            supported = self.diagnosis_eval.is_supported(self.bayes_net, dx)

        # Use bayes only as internal “alternatives to probe”
        bayes_top = []
        if hasattr(self.bayes_net, "conditioned_probs") and isinstance(self.bayes_net.conditioned_probs, dict):
            items = sorted(self.bayes_net.conditioned_probs.items(), key=lambda x: x[1], reverse=True)
            bayes_top = [d for d, _p in items[:4]]

        return self.attending.respond(
            state=self.state,
            ehr_summary=self.ehr_summary,
            student_text=student_input,
            parsed=parsed,
            diagnosis_supported=supported,
            bayes_top_diagnoses=bayes_top,
        )
