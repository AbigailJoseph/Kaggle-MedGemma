from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

@dataclass
class ConversationState:
    """
    Tracks the student's clinical reasoning state across turns.
    """
    turn_number: int = 0

    symptoms_identified: List[str] = field(default_factory=list)
    symptoms_absent: List[str] = field(default_factory=list)
    student_diagnosis: Optional[str] = None

    # LLM grounding artifacts (computed once per case)
    bayes_summary: Dict[str, Any] = field(default_factory=dict)
    medgemma_packet: str = ""

    reasoning_progress: Dict[str, bool] = field(default_factory=lambda: {
        "identified_key_information": False,
        "generated_differential": False,
        "selected_working_diagnosis": False,
        "reflected_on_reasoning": False
    })