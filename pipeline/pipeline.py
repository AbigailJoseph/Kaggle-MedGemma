# pipeline/pipeline.py

from typing import Dict, Any, List, Tuple

from ehr.ehr_reader import EHRReader
from ehr.ehr_navigator import EHRNavigator

from bayes.noisy_or_bayesnet import NoisyORBayesNet
from bayes.network_data import PULMONARY_NETWORK_DATA, DISEASE_DISPLAY_NAMES, SYMPTOM_DISPLAY_NAMES

from parsing.student_parser import StudentInputParser
from evaluation.diagnosis_evaluator import DiagnosisEvaluator
from agents.ai_attending import AIAttending
from pipeline.state import ConversationState
from medgemma_client import query_medgemma


# EHR findings (strings) -> Bayes symptom node names
# Only map when the meaning is truly equivalent.
FINDING_TO_BAYES_SYMPTOM: Dict[str, str] = {
    "fever": "Fever",
    "shortness of breath": "Progressive_Dyspnea",
    "dyspnea": "Progressive_Dyspnea",
    "hypoxia": "Hypoxemia",
    "low o2": "Hypoxemia",
}


def _norm(s: Any) -> str:
    return str(s).strip().lower()


def build_bayes_evidence(findings: List[str]) -> Dict[str, bool]:
    """
    Convert EHR findings into Bayes evidence dict.
    Example output:
      {"Fever": True, "Progressive_Dyspnea": True, "Hypoxemia": True}
    """
    evidence: Dict[str, bool] = {}

    for f in findings:
        key = _norm(f)
        if key in FINDING_TO_BAYES_SYMPTOM:
            evidence[FINDING_TO_BAYES_SYMPTOM[key]] = True

    return evidence


def build_bayes_summary(net: NoisyORBayesNet, evidence: Dict[str, bool], top_k: int = 5) -> Dict[str, Any]:
    """
    Summarize the Bayes net in a model-friendly format.
    Includes both canonical node names and display names for readability.
    """
    ranked: List[Tuple[str, float]] = net.rank_diseases()

    return {
        "evidence": evidence,  # canonical symptom node names
        "top_differential": [
            {
                "diagnosis": d,  # canonical disease node name
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


def build_medgemma_prompt(ehr_findings: List[str], bayes_summary: Dict[str, Any]) -> str:
    """
    MedGemma prompt: use EHR + Bayes summary (ground truth) to create a concise teaching brief.
    """
    return f"""
You are MedGemma. Create a concise, structured teaching brief using ONLY the provided information.
Do NOT invent patient facts. If something is missing, say it is missing.

EHR_FINDINGS (raw extracted findings):
{ehr_findings}

BAYES_NET_SUMMARY (ground truth probabilities):
{bayes_summary}

Return:
1) One-liner summary (1 sentence).
2) Top 3 diagnoses (use the Bayes list) with 1 supporting clue each from EHR_FINDINGS.
3) 3 key missing discriminating questions (history/ROS).
4) 3 next best tests or imaging.
5) 2 short teaching pearls.

Keep it short and structured.
""".strip()


class ClinicalTutoringPipeline:
    def __init__(self):
        # 1) Load EHR + extract findings
        ehr_data = EHRReader().load_case()
        self.findings: List[str] = EHRNavigator().extract_findings(ehr_data)

        # 2) Build Bayes net + condition on evidence
        self.bayes_net = NoisyORBayesNet(PULMONARY_NETWORK_DATA)
        evidence = build_bayes_evidence(self.findings)
        self.bayes_net.set_evidence(evidence)

        # 3) State + helpers
        self.state = ConversationState()
        self.parser = StudentInputParser()
        self.diagnosis_eval = DiagnosisEvaluator()
        self.attending = AIAttending()

        # 4) Build grounding ONCE per case
        self.state.bayes_summary = build_bayes_summary(self.bayes_net, evidence, top_k=5)

        medgemma_prompt = build_medgemma_prompt(self.findings, self.state.bayes_summary)
        self.state.medgemma_packet = query_medgemma(medgemma_prompt)

    def start(self) -> str:
        """
        AI Attending speaks first.
        """
        return self.attending.initial_message(
            ehr_findings=self.findings,
            bayes_summary=self.state.bayes_summary,
            medgemma_packet=self.state.medgemma_packet,
        )

    def step(self, student_input: str) -> str:
        """
        One turn: parse student -> update state -> evaluate -> respond.
        """
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
            build_medgemma_prompt(self.state.symptoms_identified, self.state.bayes_summary)
        )

        supported = False
        if self.state.student_diagnosis:
            supported = self.diagnosis_eval.is_supported(self.bayes_net, self.state.student_diagnosis)

        self.state.turn_number += 1

        return self.attending.respond(
            self.state,
            ehr_findings=self.findings,
            student_input=student_input,
            diagnosis_supported=supported,
        )