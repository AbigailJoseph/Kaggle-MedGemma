from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class AttendingOutput:
    feedback: str
    questions: List[str]


class AIAttending:
    """
    Attending physician coach (LLM-driven).

    - Does NOT output Bayes probabilities
    - Uses Bayes only internally to (a) check plausibility and (b) choose what to probe
    - Generates constructive feedback + 1–2 targeted Socratic questions
    - Includes a "medical knowledge extraction" style step from student narrative
    """

    def __init__(self, llm_client):
        self.llm = llm_client

        self.metrics_rubric = """
EVALUATION METRICS FOR MEDICAL CASE PRESENTATIONS:

1. Focused, relevant information selection
2. Clear statement of working diagnosis
3. Logical organization + clinical reasoning links
4. Prioritized differential diagnosis
5. Conciseness
6. Prioritized diagnostic workup plan
7. Prioritized management plan and disposition
8. Hypothesis-driven inquiry
9. Ability to synthesize (not just report)
""".strip()

    def respond(
        self,
        state,
        ehr_summary: str,
        student_text: str,
        parsed: Dict,
        diagnosis_supported: bool,
        bayes_top_diagnoses: Optional[List[str]] = None,
        case_title: str = "An 89-Year-Old Man with Progressive Dyspnea",
    ) -> str:
        """
        Returns a formatted string for CLI output.
        """
        state.turn_number += 1
        state.last_student_input = student_text

        # Persist what we can (placeholder — partner may enhance parser later)
        dx = parsed.get("diagnosis")
        if dx:
            state.student_diagnosis = dx
            state.metrics_progress["working_diagnosis"] = True

        # We do NOT print Bayes results; we only use them to guide probing
        bayes_top_diagnoses = bayes_top_diagnoses or []

        extraction = self._medical_knowledge_extraction(student_text, case_title)
        output = self._coach(
            case_title=case_title,
            ehr_summary=ehr_summary,
            student_text=student_text,
            extracted=extraction,
            student_dx=dx,
            diagnosis_supported=diagnosis_supported,
            bayes_top=bayes_top_diagnoses,
        )

        return self._format(output)

    # -------------------------
    # LLM steps
    # -------------------------

    def _medical_knowledge_extraction(self, student_text: str, case_title: str) -> str:
        prompt = f"""
You are a medical knowledge extraction system.
Analyze the following student case presentation and extract:
- Key clinical findings mentioned or implied
- Claimed diagnosis (if any)
- Differential diagnoses mentioned (if any)
- Proposed tests/workup (if any)
- Proposed treatments/management (if any)
- Any missing critical information that should be addressed for this case

Case title: {case_title}

Student presentation:
{student_text}

Return your output in bullet points with short phrases, not full paragraphs.
""".strip()

        return self.llm.generate(prompt)

    def _coach(
        self,
        case_title: str,
        ehr_summary: str,
        student_text: str,
        extracted: str,
        student_dx: Optional[str],
        diagnosis_supported: bool,
        bayes_top: List[str],
    ) -> AttendingOutput:
        # We’ll use bayes_top only as a private scaffold for “likely alternatives to compare against”
        bayes_hint = ""
        if bayes_top:
            bayes_hint = (
                "Private reference only (do not reveal numeric probabilities): "
                f"Model-suggested likely alternatives include: {', '.join(bayes_top[:3])}."
            )

        prompt = f"""
You are an attending physician supervising a medical student during a case review.
Your role is to coach the student through clinical reasoning, not to give the final diagnosis.

Communication principles:
- Ask guiding questions that encourage critical thinking (differential diagnosis, pathophysiology, next best test)
- Provide feedback on the reasoning process: praise good logic and gently correct flawed reasoning
- Encourage the student to justify conclusions
- Supportive, professional, educational tone

You are an expert on this case:
{case_title}

Here is an EHR summary (ground truth context):
{ehr_summary}

Here is the extracted structure from the student presentation (analysis):
{extracted}

Rubric (for your internal evaluation):
{self.metrics_rubric}

Student's claimed working diagnosis: {student_dx if student_dx else "Not stated"}

Internal check: Is the student's diagnosis supported by the current evidence model? {diagnosis_supported}
{bayes_hint}

Task:
1) Evaluate the student's response:
   - Did they demonstrate understanding of the key reasoning elements?
   - What did they do well?
   - What gaps remain?
   - Should we move on, probe deeper, or provide a hint?
2) Generate 1–2 targeted Socratic questions that help the student demonstrate understanding of the MOST important gap(s).
Guidelines for questions:
- Open-ended, requires clinical reasoning
- Avoid yes/no
- Be specific to this case
- Do NOT list probabilities or “% likely”
- Do NOT give away the final answer

Output format EXACTLY:
FEEDBACK:
<3-7 sentences>

QUESTIONS:
1. <question>
2. <question if needed else omit>
""".strip()

        text = self.llm.generate(prompt)
        return self._parse_llm_output(text)

    # -------------------------
    # Parsing / formatting
    # -------------------------

    def _parse_llm_output(self, text: str) -> AttendingOutput:
        feedback = ""
        questions: List[str] = []

        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        mode = None
        for ln in lines:
            upper = ln.upper()
            if upper == "FEEDBACK:":
                mode = "feedback"
                continue
            if upper == "QUESTIONS:":
                mode = "questions"
                continue

            if mode == "feedback":
                feedback += (ln + " ")
            elif mode == "questions":
                # allow "1. ..." or "- ..."
                if ln[0].isdigit() and "." in ln[:3]:
                    q = ln.split(".", 1)[1].strip()
                    if q:
                        questions.append(q)
                elif ln.startswith("- "):
                    questions.append(ln[2:].strip())

        feedback = feedback.strip() if feedback else "Let’s focus on strengthening your clinical reasoning and differential."
        questions = questions[:2] if questions else ["What is your leading diagnosis and what key findings support it?"]
        return AttendingOutput(feedback=feedback, questions=questions)

    def _format(self, out: AttendingOutput) -> str:
        q_block = "\n".join([f"{i+1}. {q}" for i, q in enumerate(out.questions)])
        return f"{out.feedback}\n\nSocratic questions:\n{q_block}"
