import os
from typing import Dict, Any

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


SYSTEM_PROMPT = """You are the AI Attending Physician (AI-AP) coaching a medical student.

Hard rules:
1) Ground feedback ONLY in: BAYES_NET_SUMMARY, MEDGEMMA_KNOWLEDGE_PACKET, EVALUATION_PACKET.
2) Never invent patient facts.
3) Be constructive, specific, and brief.

Output format every time (strict):
- 1-2 sentences: Coaching feedback tied to Bayes + MedGemma.
- "Evaluation (9 metrics):" 3 bullets:
   • Top strengths (1-2)
   • Top gaps (1-2)
   • Next focus metric
- End with EXACTLY ONE question (prefer one from EVALUATION_PACKET['questions'] if present).
"""


class AIAttending:
    def __init__(self, model: str = None):
        if OpenAI is None:
            raise RuntimeError("openai package not installed. Run: pip install openai")

        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def initial_message(self, bayes_summary: Dict[str, Any], medgemma_packet: str) -> str:
        context = self._make_context(bayes_summary, medgemma_packet, student_state={"turn_number": 0})
        return self._chat(context, user_message="(Start the session.)")

    def respond(self, state, student_input: str, diagnosis_supported: bool) -> str:
        student_state = {
            "turn_number": state.turn_number,
            "student_diagnoses": state.student_diagnoses,
            "diagnosis_supported": diagnosis_supported,
            "symptoms_identified": state.symptoms_identified,
        }
        context = self._make_context(state.bayes_summary, state.medgemma_packet, student_state, eval_packet=state.eval_packet)
        return self._chat(context, user_message=student_input)

    def _make_context(self, bayes_summary, medgemma_packet, student_state, eval_packet=None) -> str:
        return f"""BAYES_NET_SUMMARY:
{bayes_summary}

MEDGEMMA_KNOWLEDGE_PACKET:
{medgemma_packet}

EVALUATION_SUMMARY:
{eval_packet.get("evaluation", {})}

EVALUATION_QUESTIONS:
{eval_packet.get("questions", [])}

STUDENT_STATE:
{student_state}
"""

    def _chat(self, context: str, user_message: str) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "developer", "content": context},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
        )
        return resp.choices[0].message.content.strip()
