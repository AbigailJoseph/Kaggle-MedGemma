class AIAttending:
    def respond(self, state, bayes_net, diagnosis_supported: bool) -> str:

        if state.student_diagnosis is None:
            return "What diagnosis are you considering based on the patient data?"

        if diagnosis_supported:
            return (
                f"Your diagnosis of {state.student_diagnosis} is supported by "
                "the patient’s clinical findings. Can you explain your reasoning?"
            )

        return (
            f"The patient’s data doesn’t strongly support {state.student_diagnosis}. "
            "What alternative diagnoses could better explain the findings?"
        )
