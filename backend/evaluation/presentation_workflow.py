# evaluation/presentation_workflow.py
import json
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from openai import OpenAI


METRICS_RUBRIC = """
EVALUATION METRICS FOR MEDICAL CASE PRESENTATIONS:

    1. FOCUSED, RELEVANT INFORMATION SELECTION (MOST IMPORTANT)
       - Includes only details that support their diagnosis
       - Omits extraneous information that doesn't impact reasoning
       - Shows diagnostic thinking, not passive reporting
    
    2. CLEAR STATEMENT OF WORKING DIAGNOSIS
       - States hypothesis early in presentation
       - Justifies with structured data
       - Shows confidence and synthesis ability
    
    3. LOGICAL ORGANIZATION + CLINICAL REASONING
       - Explains how symptoms → reasoning → diagnosis connect
       - Uses "why" statements to connect findings to hypotheses
       - Demonstrates proper clinical reasoning flow
    
    4. INCLUSION OF PRIORITIZED DIFFERENTIAL DIAGNOSIS
       - Provides alternative diagnoses considered
       - Prioritizes differentials logically
       - Avoids unfocused long lists
    
    5. CONCISENESS + EFFICIENT DELIVERY
       - Presentation is short (few minutes)
       - Well-structured and purposeful
       - No wandering or unfocused content
    
    6. PRIORITIZED, RATIONAL DIAGNOSTIC WORKUP PLAN
       - Identifies which initial tests are needed first
       - Explains why tests matter and how they change management
       - Shows understanding of test prioritization
    
    7. PRIORITIZED MANAGEMENT PLAN AND DISPOSITION
       - Management is ordered and justified
       - Avoids unnecessary tests
       - Links decisions back to diagnosis
    
    8. EVIDENCE OF HYPOTHESIS-DRIVEN INQUIRY
       - Shows clear working hypothesis
       - Knows which information matters
       - Each piece of plan flows from hypothesis
    
    9. ABILITY TO SYNTHESIZE (NOT JUST REPORT)
       - Provides summary statements
       - Distills key clues
       - Shows clear pivot from data → meaning
""".strip()


@dataclass
class EvalState:
    interaction_count: int = 0
    max_interactions: int = 15
    initial_presentation: str = ""
    # metric_id -> {name, status, confidence}
    metrics_status: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    initial_evaluation: Optional[Dict[str, Any]] = None
    all_metrics_met_turn: Optional[int] = None  # turn index when achieved


class PresentationWorkflow:
    """
    OpenAI-based version of hackathon workflow:
    - Evaluate initial presentation against 9 metrics
    - Generate probing questions for missing/partial metrics
    - Track how many turns until all metrics are met
    """

    def __init__(self, model: Optional[str] = None):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.state = EvalState()

    def reset(self):
        self.state = EvalState()

    def evaluate_initial(
        self,
        student_presentation: str,
        *,
        case_narrative: str,
        bayes_summary: Dict[str, Any],
        medgemma_packet: str,
    ) -> Dict[str, Any]:
        self.reset()
        self.state.interaction_count = 0
        self.state.initial_presentation = student_presentation

        evaluation = self._evaluate_presentation(
            student_presentation,
            case_narrative=case_narrative,
            bayes_summary=bayes_summary,
            medgemma_packet=medgemma_packet,
        )
        self.state.initial_evaluation = evaluation

        self._hydrate_metrics_status(evaluation)

        gaps = [e for e in evaluation["evaluations"] if e["status"] in ["missing", "partial", "misconception"]]
        questions = self._generate_questions(
            missing_metrics=gaps[:3],
            case_narrative=case_narrative,
            bayes_summary=bayes_summary,
            medgemma_packet=medgemma_packet,
            conversation_history=[],
        )

        # store questions so you can evaluate answers later if you want
        for q in questions:
            self.state.conversation_history.append({"question": q, "answer": None})

        return {
            "evaluation": evaluation,
            "questions": questions,
            "metrics_status": self.state.metrics_status,
        }

    def process_answer(
        self,
        student_answer: str,
        *,
        case_narrative: str,
        bayes_summary: Dict[str, Any],
        medgemma_packet: str,
    ) -> Dict[str, Any]:
        self.state.interaction_count += 1

        # attach answer to all currently unanswered questions (student replies to the batch)
        for turn in self.state.conversation_history:
            if turn["answer"] is None:
                turn["answer"] = student_answer

        # Re-evaluate the *current* presentation state as:
        # original presentation + conversation so far (simple and robust)
        stitched = self._stitch_presentation()

        evaluation = self._evaluate_presentation(
            stitched,
            case_narrative=case_narrative,
            bayes_summary=bayes_summary,
            medgemma_packet=medgemma_packet,
        )
        self._hydrate_metrics_status(evaluation)

        remaining = [m for m in evaluation["evaluations"] if m["status"] in ["missing", "partial", "misconception"]]

        if not remaining and self.state.all_metrics_met_turn is None:
            self.state.all_metrics_met_turn = self.state.interaction_count

        if not remaining:
            return {
                "done": True,
                "evaluation": evaluation,
                "metrics_status": self.state.metrics_status,
                "turns_to_meet_all_metrics": self.state.all_metrics_met_turn,
            }

        if self.state.interaction_count >= self.state.max_interactions:
            return {
                "done": True,
                "timeout": True,
                "evaluation": evaluation,
                "metrics_status": self.state.metrics_status,
                "turns_to_meet_all_metrics": None,
            }

        questions = self._generate_questions(
            missing_metrics=remaining[:3],
            case_narrative=case_narrative,
            bayes_summary=bayes_summary,
            medgemma_packet=medgemma_packet,
            conversation_history=self.state.conversation_history[-4:],
        )
        for q in questions:
            self.state.conversation_history.append({"question": q, "answer": None})

        return {
            "done": False,
            "evaluation": evaluation,
            "questions": questions,
            "metrics_status": self.state.metrics_status,
        }

    def final_summary(self) -> Dict[str, Any]:
        met = sum(1 for m in self.state.metrics_status.values() if m["status"] == "met")
        total = len(self.state.metrics_status) if self.state.metrics_status else 9
        return {
            "metrics_met": f"{met}/{total}",
            "turns": self.state.interaction_count,
            "turns_to_meet_all_metrics": self.state.all_metrics_met_turn,
            "metrics_status": self.state.metrics_status,
            "conversation_history": self.state.conversation_history,
        }

    # ---------------- internal helpers ----------------

    def _stitch_presentation(self) -> str:
        parts = [self.state.initial_presentation]
        for t in self.state.conversation_history:
            if t.get("question") and t.get("answer"):
                parts.append(f"Q: {t['question']}\nA: {t['answer']}")
        return "\n\n".join(parts).strip()

    def _hydrate_metrics_status(self, evaluation: Dict[str, Any]) -> None:
        # Build/update metrics_status snapshot
        ms: Dict[str, Dict[str, Any]] = {}
        for e in evaluation.get("evaluations", []):
            ms[e["metric_id"]] = {
                "name": e["metric_name"],
                "status": e["status"],
                "confidence": e["confidence"],
            }
        # If evaluator ever fails to return 9, keep old values
        if len(ms) >= 6:
            self.state.metrics_status = ms

    def _evaluate_presentation(
        self,
        student_text: str,
        *,
        case_narrative: str,
        bayes_summary: Dict[str, Any],
        medgemma_packet: str,
    ) -> Dict[str, Any]:
        prompt = f"""
You are an expert medical attending physician evaluating a student's case presentation.

{METRICS_RUBRIC}

GROUNDING CONTEXT (do not invent facts):
CASE_NARRATIVE:
{case_narrative}

BAYES_NET_SUMMARY:
{json.dumps(bayes_summary, indent=2)}

MEDGEMMA_KNOWLEDGE_PACKET:
{medgemma_packet}

STUDENT TEXT TO EVALUATE:
---
{student_text}
---

Evaluate against ALL 9 metrics. For each metric return:
- status: "met", "partial", "missing", or "misconception"
- confidence: 0.0 to 1.0
- evidence: short quote/observation
- gaps: short missing items (only if not "met")

CRITICAL: Return ONLY valid JSON.

Return format:
{{
  "evaluations": [
    {{
      "metric_id": "1",
      "metric_name": "Focused, Relevant Information Selection",
      "status": "met|partial|missing|misconception",
      "confidence": 0.0,
      "evidence": "...",
      "gaps": "..."
    }}
  ],
  "overall_assessment": "...",
  "priority_gaps": ["..."]
}}
""".strip()

        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0,
        )
        return json.loads(resp.choices[0].message.content)

    def _generate_questions(
        self,
        *,
        missing_metrics: List[Dict[str, Any]],
        case_narrative: str,
        bayes_summary: Dict[str, Any],
        medgemma_packet: str,
        conversation_history: List[Dict[str, Any]],
    ) -> List[str]:
        history_text = "\n".join(
            [f"Q: {t['question']}\nA: {t.get('answer','')}" for t in conversation_history if t.get("question")]
        ).strip() or "None."

        prompt = f"""
You are a medical attending using the Socratic method.

Missing/Partial/Misconception metrics to address (top priority first):
{json.dumps(missing_metrics, indent=2)}

GROUNDING CONTEXT:
CASE_NARRATIVE:
{case_narrative}

BAYES_NET_SUMMARY:
{json.dumps(bayes_summary, indent=2)}

MEDGEMMA_KNOWLEDGE_PACKET:
{medgemma_packet}

Recent conversation:
{history_text}

Generate 1-2 targeted, open-ended questions that push the student to address the gaps.
Avoid yes/no. Keep each question <= 25 words.

Return ONLY JSON:
{{ "questions": ["...", "..."] }}
""".strip()

        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        data = json.loads(resp.choices[0].message.content)
        return [q for q in data.get("questions", []) if isinstance(q, str)]