# parsing/student_parser.py

class StudentInputParser:
    """
    Extracts symptoms + diagnosis from student free text.
    Outputs disease names that match bayes/network_data.py (e.g., Pneumonia, Edema, PE).
    """

    DIAG_KEYWORDS = [
        ("pneumonia", "Pneumonia"),
        ("pulmonary embolism", "PE"),
        ("embolism", "PE"),
        ("pe", "PE"),
        ("heart failure", "Edema"),
        ("pulmonary edema", "Edema"),
        ("edema", "Edema"),
        ("copd", "COPD"),
        ("infection", "Infection"),
        ("fibrosis", "Fibrosis"),
        ("asbestosis", "Asbestosis"),
        ("hemorrhage", "Hemorrhage"),
        ("lv decomp", "LV_Decomp"),
    ]

    SYMPTOM_KEYWORDS = [
        ("fever", "Fever"),
        ("hypoxia", "Hypoxemia"),
        ("shortness of breath", "Progressive_Dyspnea"),
        ("dyspnea", "Progressive_Dyspnea"),
        ("chest pain", "Chest_Pain"),
        ("tachypnea", "Tachypnea"),
        ("hemoptysis", "Hemoptysis"),
        ("crackles", "Crackles"),
        ("jvp", "Elevated_JVP"),
        ("altered mental status", "Altered_Mental_Status"),
        ("confusion", "Altered_Mental_Status"),
    ]

    def parse(self, text: str) -> dict:
        t = (text or "").lower()

        symptoms = []
        for kw, sym in self.SYMPTOM_KEYWORDS:
            if kw in t and sym not in symptoms:
                symptoms.append(sym)

        diagnosis = None
        for kw, dx in self.DIAG_KEYWORDS:
            if kw in t:
                diagnosis = dx
                break

        return {"symptoms": symptoms, "diagnosis": diagnosis}