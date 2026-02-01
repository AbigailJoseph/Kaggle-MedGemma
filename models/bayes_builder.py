from models.bayes_net import BayesianDiagnosisModel

class BayesNetBuilder:
    def build_from_findings(self, findings: list) -> BayesianDiagnosisModel:
        """
        Builds or conditions a Bayes Net based on EHR findings.
        """
        bayes_net = BayesianDiagnosisModel()

        # In reality: condition probabilities based on evidence
        bayes_net.condition_on_findings(findings)

        return bayes_net
