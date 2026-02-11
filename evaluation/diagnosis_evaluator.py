class DiagnosisEvaluator:
    # Map student diagnosis strings → Bayes net disease keys
    DIAGNOSIS_TO_DISEASE = {
        "pneumonia": "Pneumonia",
        "heart_failure": "LV_Decomp",
        "pulmonary_embolism": "PE",
    }

    def is_supported(self, bayes_net, diagnosis: str) -> bool:
        disease = self.DIAGNOSIS_TO_DISEASE.get(diagnosis)
        if disease is None:
            return False
        return bayes_net.query_disease(disease) >= 0.3
