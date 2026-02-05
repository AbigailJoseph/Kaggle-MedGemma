from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class LLMConfig:
    model_id: str = os.getenv("MEDGEMMA_MODEL_ID", "google/medgemma-2b-it")
    max_new_tokens: int = int(os.getenv("MEDGEMMA_MAX_NEW_TOKENS", "256"))
    temperature: float = float(os.getenv("MEDGEMMA_TEMPERATURE", "0.4"))
    top_p: float = float(os.getenv("MEDGEMMA_TOP_P", "0.9"))


class MedGemmaClient:
    """
    Minimal local HF Transformers client.
    Works if you're running in an environment with transformers + torch + model weights.

    If you are using Kaggle and have MedGemma available, this is the simplest path.
    """

    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self._pipe = None

    def _lazy_init(self):
        if self._pipe is not None:
            return

        try:
            from transformers import pipeline
        except Exception as e:
            raise RuntimeError(
                "transformers is not available. Install it or run in an environment that has it."
            ) from e

        # text-generation pipeline
        self._pipe = pipeline(
            "text-generation",
            model=self.config.model_id,
            tokenizer=self.config.model_id,
            device_map="auto",
        )

    def generate(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        self._lazy_init()

        outputs = self._pipe(
            prompt,
            max_new_tokens=self.config.max_new_tokens,
            do_sample=True if self.config.temperature > 0 else False,
            temperature=self.config.temperature,
            top_p=self.config.top_p,
            return_full_text=False,
        )

        text = outputs[0]["generated_text"]

        # crude stop handling (optional)
        if stop:
            for s in stop:
                idx = text.find(s)
                if idx != -1:
                    text = text[:idx]
        return text.strip()
