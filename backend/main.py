from pipeline.pipeline import ClinicalTutoringPipeline
from pathlib import Path
from dotenv import load_dotenv
ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

def main():
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
