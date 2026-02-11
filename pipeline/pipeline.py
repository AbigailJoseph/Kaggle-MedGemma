from ehr.ehr_reader import EHRReader
from ehr.ehr_navigator import EHRNavigator
from bayes.noisy_or_bayesnet import NoisyORBayesNet
from bayes.network_data import PULMONARY_NETWORK_DATA
from parsing.student_parser import StudentInputParser
from evaluation.diagnosis_evaluator import DiagnosisEvaluator
from agents.ai_attending import AIAttending
from pipeline.state import ConversationState

# Map EHR finding strings → Bayes net symptom keys
FINDING_TO_SYMPTOM = {
    "fever": "Fever",
    "cough": "Crackles",
    "shortness of breath": "Progressive_Dyspnea",
    "hypoxia": "Hypoxemia",
    "chest pain": "Chest_Pain",
}

class ClinicalTutoringPipeline:
    def __init__(self):
        # 1. Load & process EHR
        ehr_data = EHRReader().load_case()
        findings = EHRNavigator().extract_findings(ehr_data)

        # 2. Build Bayes Net and set evidence from EHR
        self.bayes_net = NoisyORBayesNet(PULMONARY_NETWORK_DATA)
        evidence = {FINDING_TO_SYMPTOM[f]: True
                    for f in findings if f in FINDING_TO_SYMPTOM}
        self.bayes_net.set_evidence(evidence)

        # 3. Initialize tutoring components
        self.state = ConversationState()
        self.parser = StudentInputParser()
        self.diagnosis_eval = DiagnosisEvaluator()
        self.attending = AIAttending()

    def step(self, student_input: str) -> str:
        parsed = self.parser.parse(student_input)
        self.state.student_diagnosis = parsed["diagnosis"]

        supported = self.diagnosis_eval.is_supported(
            self.bayes_net,
            self.state.student_diagnosis
        )

        return self.attending.respond(
            self.state,
            self.bayes_net,
            supported
        )
