# pipeline/pipeline.py

from typing import Dict, Any, List, Tuple

from bayes.noisy_or_bayesnet import NoisyORBayesNet
from bayes.network_data import PULMONARY_NETWORK_DATA, DISEASE_DISPLAY_NAMES, SYMPTOM_DISPLAY_NAMES

from parsing.student_parser import StudentInputParser
from evaluation.diagnosis_evaluator import DiagnosisEvaluator
from agents.ai_attending import AIAttending
from pipeline.state import ConversationState
from medgemma_client import query_medgemma


def build_bayes_summary(net: NoisyORBayesNet, evidence: Dict[str, bool], top_k: int = 5) -> Dict[str, Any]:
    """
    Summarize the Bayes net in a model-friendly format.
    Includes both canonical node names and display names for readability.
    """
    ranked: List[Tuple[str, float]] = net.rank_diseases()

    return {
        "evidence": evidence,
        "top_differential": [
            {
                "diagnosis": d,
                "diagnosis_display": DISEASE_DISPLAY_NAMES.get(d, d),
                "probability": round(float(p), 4),
            }
            for d, p in ranked[:top_k]
        ],
        "evidence_display": [
            {
                "symptom": s,
                "symptom_display": SYMPTOM_DISPLAY_NAMES.get(s, s),
                "value": bool(v),
            }
            for s, v in evidence.items()
        ],
    }


def build_medgemma_prompt(bayes_summary: Dict[str, Any]) -> str:
    return f"""
You are MedGemma. Create a concise, structured teaching brief using ONLY the provided information.
Do NOT invent patient facts. If something is missing, say it is missing.

BAYES_NET_SUMMARY (ground truth probabilities):
{bayes_summary}

Return:
1) One-liner summary (1 sentence).
2) Top 3 diagnoses (use the Bayes list) with 1 supporting clue each.
3) 3 key missing discriminating questions (history/ROS).
4) 3 next best tests or imaging.
5) 2 short teaching pearls.

Keep it short and structured.
""".strip()


class ClinicalTutoringPipeline:
    def __init__(self):
        self.bayes_net = NoisyORBayesNet(PULMONARY_NETWORK_DATA)
        self.state = ConversationState()
        self.parser = StudentInputParser()
        self.diagnosis_eval = DiagnosisEvaluator()
        self.attending = AIAttending()

    def start(self) -> str:
        return self.attending.initial_message(
            bayes_summary=self.state.bayes_summary,
            medgemma_packet=self.state.medgemma_packet,
        )

    def step(self, student_input: str) -> str:
        parsed = self.parser.parse(student_input)
        self.state.student_diagnosis = parsed.get("diagnosis")

        # Track symptoms across turns
        for s in parsed.get("present", []):
            if s not in self.state.symptoms_identified:
                self.state.symptoms_identified.append(s)
        for s in parsed.get("absent", []):
            if s not in self.state.symptoms_absent:
                self.state.symptoms_absent.append(s)

        # Update Bayes net — present pushes up, absent pushes down
        evidence = {s: True for s in self.state.symptoms_identified}
        evidence.update({s: False for s in self.state.symptoms_absent})
        self.bayes_net.set_evidence(evidence)
        self.state.bayes_summary = build_bayes_summary(self.bayes_net, evidence, top_k=5)

        # Re-query MedGemma with updated differential
        self.state.medgemma_packet = query_medgemma(
            build_medgemma_prompt(self.state.bayes_summary)
        )

        supported = False
        if self.state.student_diagnosis:
            supported = self.diagnosis_eval.is_supported(self.bayes_net, self.state.student_diagnosis)

        self.state.turn_number += 1

        return self.attending.respond(
            self.state,
            student_input=student_input,
            diagnosis_supported=supported,
        )
