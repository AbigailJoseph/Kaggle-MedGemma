class MedicalStudentAgent:
    """
    LLM-driven medical student agent.
    Uses OpenAI for clinical reasoning and responses.
    """

    def __init__(self, llm_client):
        self.llm = llm_client

    def present_case(self, ehr_data: dict) -> str:
        prompt = f"""
You are a medical student presenting a patient case to an attending physician.

EHR data:
{ehr_data}

Present a concise oral case including:
- Chief complaint
- Pertinent history
- Key exam and lab findings
- Working diagnosis with justification
""".strip()

        return self.llm.generate(prompt)

    def respond_to_attending(self, attending_question: str, ehr_data: dict) -> str:
        prompt = f"""
You are a medical student responding to an attending physician.

EHR data:
{ehr_data}

Attending question:
{attending_question}

Respond using clear clinical reasoning and pathophysiology.
""".strip()

        return self.llm.generate(prompt)
