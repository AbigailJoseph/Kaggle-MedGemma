import json
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

VALID_SYMPTOMS = [
    "Progressive_Dyspnea", "Crackles", "Hypoxemia", "Tachypnea", "Fever",
    "Chest_Pain", "Hemoptysis", "Elevated_JVP", "Bilateral_Opacities",
    "RV_Dysfunction", "Calcified_Plaques", "Pulm_Hypertension", "Altered_Mental_Status",
]

VALID_DISEASES = [
    "Asbestosis", "Edema", "Pneumonia", "Hemorrhage", "Fibrosis",
    "Infection", "LV_Decomp", "COPD", "PE",
]


class StudentInputParser:
    """
    Uses OpenAI to extract symptoms + diagnosis from student free text.
    Returns names matching bayes/network_data.py.
    """

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def parse(self, text: str) -> dict:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": (
                    f"Extract symptoms and diagnoses from student clinical text.\n"
                    f"Return JSON: {{\"present\": [...], \"absent\": [...], \"diagnoses\": [...]}}\n"
                    f"- 'present': symptoms the student confirms are present\n"
                    f"- 'absent': symptoms the student explicitly states are absent or ruled out\n"
                    f"- 'diagnoses': all diagnoses the student proposes as possibilities (their differential list), even if uncertain\n"
                    f"Valid symptoms: {VALID_SYMPTOMS}\n"
                    f"Valid diseases: {VALID_DISEASES}\n"
                    f"Only return names from these lists exactly as written."
                )},
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        result = json.loads(resp.choices[0].message.content)
        present = [s for s in result.get("present", []) if s in VALID_SYMPTOMS]
        absent = [s for s in result.get("absent", []) if s in VALID_SYMPTOMS]
        diagnoses = result.get("diagnoses", [])  # DO NOT FILTER

        return {
            "present": present,
            "absent": absent,
            "diagnoses": diagnoses,
        }
