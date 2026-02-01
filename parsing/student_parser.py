class StudentInputParser:
    """
    Placeholder parser that extracts symptoms and diagnoses
    from student free-text input.
    """

    def parse(self, text: str) -> dict:
        text = text.lower()

        symptoms = []
        diagnosis = None

        # Very naive keyword-based symptom detection
        known_symptoms = [
            "fever",
            "cough",
            "shortness of breath",
            "chest pain"
        ]

        for symptom in known_symptoms:
            if symptom in text:
                symptoms.append(symptom)

        # Naive diagnosis detection
        if "pneumonia" in text:
            diagnosis = "pneumonia"
        elif "heart failure" in text:
            diagnosis = "heart_failure"
        elif "pulmonary embolism" in text:
            diagnosis = "pulmonary_embolism"

        return {
            "symptoms": symptoms,
            "diagnosis": diagnosis
        }
