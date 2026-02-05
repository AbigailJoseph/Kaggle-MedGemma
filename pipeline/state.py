from dataclasses import dataclass, field
from typing import List, Optional, Dict


@dataclass
class ConversationState:
    """
    Tracks the student's clinical reasoning state across turns.
    """

    turn_number: int = 0

    # Latest input
    last_student_input: str = ""

    # What the student has identified so far
    symptoms_identified: List[str] = field(default_factory=list)
    student_diagnosis: Optional[str] = None

    # Optional structured elements (student can supply later; partner may parse)
    student_differential: List[str] = field(default_factory=list)
    student_workup_plan: List[str] = field(default_factory=list)
    student_management_plan: List[str] = field(default_factory=list)

    # Model-driven reference (for coaching)
    last_bayes_differential: List[str] = field(default_factory=list)

    # Reasoning milestones (human-centered evaluation targets)
    metrics_progress: Dict[str, bool] = field(default_factory=lambda: {
        "focused_information": False,
        "working_diagnosis": False,
        "reasoning_links": False,
        "prioritized_differential": False,
        "diagnostic_workup": False,
        "management_plan": False,
        "synthesis_statement": False,
    })
