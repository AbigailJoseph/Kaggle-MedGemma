from dotenv import load_dotenv
load_dotenv()

import os
from google.cloud import aiplatform

# Configuration
PROJECT_ID = os.getenv("MEDGEMMA_PROJECT_ID")
LOCATION = "us-central1"
ENDPOINT_ID = os.getenv("MEDGEMMA_ENDPOINT_ID")

def query_medgemma(prompt):
    # Initialize the SDK
    aiplatform.init(project=PROJECT_ID, location=LOCATION)

    # Reference the existing endpoint
    endpoint = aiplatform.Endpoint(ENDPOINT_ID)

    # MedGemma 1.5 4B-IT (vLLM) expects 'prompt'
    instance = {
        "prompt": prompt,
    }

    # vLLM-compatible parameters
    parameters = {
        "temperature": 0.2,
        "max_tokens": 1024,
        "top_p": 0.95,
    }

    try:
        response = endpoint.predict(instances=[instance], parameters=parameters)
        
        # Extracting the text from the vLLM response format
        for prediction in response.predictions:
            # vLLM usually returns a string or a dict with 'text' or 'generated_text'
            if isinstance(prediction, dict) and "text" in prediction:
                print(f"MedGemma Response: {prediction['text']}")
            else:
                # If it's a raw string, print it directly
                print(f"MedGemma Response: {prediction}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Instruction-tuned models work best with clear "Question/Answer" formats
    user_prompt = "Question: What are the common symptoms of Type 2 Diabetes?\nAnswer:"
    query_medgemma(user_prompt)