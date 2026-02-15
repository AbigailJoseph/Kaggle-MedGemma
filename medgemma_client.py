from dotenv import load_dotenv
load_dotenv()

import os

from google.cloud import aiplatform

# Configuration - Replace these with your actual details
PROJECT_ID = os.getenv("MEDGEMMA_PROJECT_ID")
LOCATION = "us-central1"
ENDPOINT_ID = os.getenv("MEDGEMMA_ENDPOINT_ID")

def query_medgemma(prompt):
    # Initialize the SDK
    aiplatform.init(project=PROJECT_ID, location=LOCATION)

    # Reference the existing endpoint
    endpoint = aiplatform.Endpoint(ENDPOINT_ID)

    # MedGemma expects instances in a specific format
    # Note: MedGemma 1.5 often uses a "thinking" or "multimodal" format 
    # depending on the specific variant (2B, 7B, 27B)
    instance = {
        "content": prompt,
    }

    # Optional: adjust parameters like temperature or max output tokens
    parameters = {
        "temperature": 0.2,
        "max_output_tokens": 1024,
    }

    response = endpoint.predict(instances=[instance], parameters=parameters)
    
    for prediction in response.predictions:
        print(f"MedGemma Response: {prediction}")

if __name__ == "__main__":
    user_prompt = "What are the common symptoms of Type 2 Diabetes?"
    query_medgemma(user_prompt)