from dataclasses import dataclass, field
from typing import List, Optional, Dict

@dataclass
class ConversationState:
    """
    Tracks the student's clinical reasoning state across turns.
    """

    turn_number: int = 0

    # What the student has identified so far
    symptoms_identified: List[str] = field(default_factory=list)
    student_diagnosis: Optional[str] = None

    # Reasoning milestones (human-centered evaluation targets)
    reasoning_progress: Dict[str, bool] = field(default_factory=lambda: {
        "identified_key_information": False,
        "generated_differential": False,
        "selected_working_diagnosis": False,
        "reflected_on_reasoning": False
    })
