class EHRNavigator:
    def extract_findings(self, ehr_data: dict) -> list:
        """
        Extracts clinically salient findings from EHR.
        """
        findings = []

        findings.extend(ehr_data.get("symptoms", []))

        if ehr_data["vitals"]["spo2"] < 92:
            findings.append("hypoxia")

        if ehr_data["labs"]["wbc"] > 12000:
            findings.append("leukocytosis")

        return findings
