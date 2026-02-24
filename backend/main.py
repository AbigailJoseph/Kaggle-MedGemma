"""CLI entrypoint for running a local clinical tutoring session.

This script loads environment variables from `backend/.env`, creates a
`ClinicalTutoringPipeline`, and loops over student input until the user exits.
"""

from pathlib import Path

from dotenv import load_dotenv

from pipeline.pipeline import ClinicalTutoringPipeline

ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)


def main():
    """Run an interactive terminal session with the tutoring pipeline."""
    pipeline = ClinicalTutoringPipeline()

    print("Type 'exit' to end the session.\n")

    while True:
        student_input = input("Student: ")

        if student_input.lower() in {"exit", "quit"}:
            print("AI Attending:", pipeline.final_evaluation())
            break

        response = pipeline.step(student_input)
        print(f"AI Attending: {response}\n")


if __name__ == "__main__":
    main()
