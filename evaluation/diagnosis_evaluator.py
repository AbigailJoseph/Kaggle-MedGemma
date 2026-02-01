class DiagnosisEvaluator:
    def is_supported(self, bayes_net, diagnosis: str) -> bool:
        return bayes_net.probability_of(diagnosis) >= 0.3
