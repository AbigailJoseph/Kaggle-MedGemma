class BayesianDiagnosisModel:
    def __init__(self):
        self.base_probs = {
            "pneumonia": 0.3,
            "heart_failure": 0.2,
            "pulmonary_embolism": 0.1
        }

        self.conditioned_probs = self.base_probs.copy()

    def condition_on_findings(self, findings: list):
        """
        Placeholder Bayesian update.
        """
        if "fever" in findings and "cough" in findings:
            self.conditioned_probs["pneumonia"] += 0.4

        if "hypoxia" in findings:
            self.conditioned_probs["pulmonary_embolism"] += 0.2

    def probability_of(self, diagnosis: str) -> float:
        return self.conditioned_probs.get(diagnosis, 0.05)
