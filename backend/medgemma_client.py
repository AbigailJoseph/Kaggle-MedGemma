"""Thin client for querying the deployed MedGemma Vertex AI endpoint."""

import os
from pathlib import Path

from dotenv import load_dotenv
from google.cloud import aiplatform

ENV_PATH = Path(__file__).resolve().with_name('.env')
load_dotenv(dotenv_path=ENV_PATH)

PROJECT_ID = os.getenv('MEDGEMMA_PROJECT_ID')
LOCATION = 'us-central1'
ENDPOINT_ID = os.getenv('MEDGEMMA_ENDPOINT_ID')


def query_medgemma(prompt: str, *, temperature: float = 0.2, max_tokens: int = 1024, top_p: float = 0.95) -> str:
    """Call the MedGemma endpoint with a text prompt.

    Args:
        prompt: Prompt text sent to the hosted model endpoint.
        temperature: Sampling temperature for response diversity.
        max_tokens: Maximum output token budget.
        top_p: Nucleus sampling parameter.

    Returns:
        A newline-joined text response assembled from endpoint predictions.

    Raises:
        RuntimeError: If required endpoint environment variables are missing.
    """
    if not PROJECT_ID or not ENDPOINT_ID:
        raise RuntimeError('Missing MEDGEMMA_PROJECT_ID or MEDGEMMA_ENDPOINT_ID in environment variables.')

    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    endpoint = aiplatform.Endpoint(ENDPOINT_ID)

    instance = {'prompt': prompt}
    parameters = {'temperature': temperature, 'max_tokens': max_tokens, 'top_p': top_p}

    response = endpoint.predict(instances=[instance], parameters=parameters)

    # vLLM usually returns either a raw string or a dict with "text"
    parts = []
    for pred in response.predictions:
        if isinstance(pred, dict) and 'text' in pred:
            parts.append(str(pred['text']))
        else:
            parts.append(str(pred))
    return '\n'.join(parts).strip()
