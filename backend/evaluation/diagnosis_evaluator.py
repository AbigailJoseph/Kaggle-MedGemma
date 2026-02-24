# evaluation/diagnosis_evaluator.py

from typing import Any, Dict, Optional

# Map student-friendly labels → BayesNet disease node names
DX_ALIASES: Dict[str, str] = {
    "pneumonia": "Pneumonia",
    "pe": "PE",
    "pulmonary embolism": "PE",
    "pulmonary_embolism": "PE",
    "heart failure": "Edema",          # pulmonary edema node in your network
    "heart_failure": "Edema",
    "pulmonary edema": "Edema",
    "edema": "Edema",
    "copd": "COPD",
    "infection": "Infection",
    "fibrosis": "Fibrosis",
    "asbestosis": "Asbestosis",
    "hemorrhage": "Hemorrhage",
    "lv decomp": "LV_Decomp",
    "lv_decomp": "LV_Decomp",
}

class DiagnosisEvaluator:
    """
    Determines whether a student diagnosis is reasonably supported by the Bayes net.
    Works with NoisyORBayesNet (query_disease, rank_diseases) or any model that provides probability_of().
    """

    def canonicalize(self, diagnosis: Optional[str]) -> Optional[str]:
        """Map user-facing diagnosis text to the Bayes node name when possible."""
        if not diagnosis:
            return None
        key = diagnosis.strip().lower()
        return DX_ALIASES.get(key, diagnosis)

    def probability(self, bayes_net: Any, diagnosis: str) -> float:
        """Return posterior probability for a diagnosis using supported net APIs."""
        dx = self.canonicalize(diagnosis)
        if dx is None:
            return 0.0

        if hasattr(bayes_net, "query_disease"):
            try:
                return float(bayes_net.query_disease(dx))
            except Exception:
                return 0.0

        if hasattr(bayes_net, "probability_of"):
            return float(bayes_net.probability_of(dx))

        return 0.0

    def is_supported(self, bayes_net: Any, diagnosis: str, *, min_prob: float = 0.20, top_k: int = 3) -> bool:
        """
        Supported if:
        - dx is in top_k posterior OR
        - posterior >= min_prob
        """
        dx = self.canonicalize(diagnosis)
        if dx is None:
            return False

        p = self.probability(bayes_net, dx)
        if p >= min_prob:
            return True

        if hasattr(bayes_net, "rank_diseases"):
            ranked = bayes_net.rank_diseases()
            top = [d for d, _ in ranked[:top_k]]
            return dx in top

        return False
