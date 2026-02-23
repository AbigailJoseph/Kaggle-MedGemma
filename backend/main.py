from pipeline.pipeline import ClinicalTutoringPipeline
from dotenv import load_dotenv
load_dotenv()

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