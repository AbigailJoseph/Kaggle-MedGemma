"""
FastAPI server that exposes the ClinicalTutoringPipeline over HTTP.

Endpoints:
  POST /api/session/start   → create a new session, get initial AI attending message
  POST /api/session/message → send a student message, get the next AI attending response

Sessions are stored in memory — they are lost when the server restarts.

Run with:
  cd backend
  uvicorn server:app --reload --port 8000
"""

import sys
import os
import uuid
from typing import Dict

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.pipeline import ClinicalTutoringPipeline


app = FastAPI(title="MedGemma Clinical Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store: session_id → pipeline instance
sessions: Dict[str, ClinicalTutoringPipeline] = {}


class StartResponse(BaseModel):
    session_id: str


class MessageRequest(BaseModel):
    session_id: str
    text: str


class MessageResponse(BaseModel):
    message: str


@app.post("/api/session/start", response_model=StartResponse)
def start_session():
    """Create a new tutoring session and return the AI attending's opening message."""
    session_id = str(uuid.uuid4())
    pipeline = ClinicalTutoringPipeline()
    sessions[session_id] = pipeline
    return StartResponse(session_id=session_id)


@app.post("/api/session/message", response_model=MessageResponse)
def send_message(body: MessageRequest):
    """Send a student message and receive the AI attending's response."""
    pipeline = sessions.get(body.session_id)
    if pipeline is None:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new session.")
    response = pipeline.step(body.text)
    return MessageResponse(message=response)
