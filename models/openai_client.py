from dotenv import load_dotenv
load_dotenv()

import os
from typing import Optional, List
from openai import OpenAI


class OpenAIClient:
    """
    Thin OpenAI wrapper that matches MedGemmaClient's interface.
    """

    def __init__(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.4,
        max_tokens: int = 300,
    ):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def generate(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical student reasoning through a clinical case.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            stop=stop,
        )

        return response.choices[0].message.content.strip()
