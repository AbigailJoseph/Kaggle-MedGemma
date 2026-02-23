"""
FastAPI server that exposes the ClinicalTutoringPipeline over HTTP.

Endpoints:
  POST /api/session/start    -> create a new authenticated session
  POST /api/session/message  -> send a student message, get the next response
  POST /api/session/finalize -> finalize and return evaluation summary

Sessions are stored in memory and are lost when the server restarts.
"""

import os
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, Optional

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from pipeline.pipeline import ClinicalTutoringPipeline

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials
except ImportError:
    firebase_admin = None
    firebase_auth = None
    credentials = None


app = FastAPI(title="MedGemma Clinical Tutor API")
ENV_PATH = Path(__file__).resolve().with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store: session_id -> {"uid": str, "pipeline": ClinicalTutoringPipeline}
sessions: Dict[str, Dict[str, Any]] = {}


class StartResponse(BaseModel):
    session_id: str


class MessageRequest(BaseModel):
    session_id: str
    text: str


class MessageResponse(BaseModel):
    message: str
    metrics_status: Optional[Dict[str, Dict[str, Any]]] = None
    evaluation: Optional[Dict[str, Any]] = None
    done: Optional[bool] = None
    turns_to_meet_all_metrics: Optional[int] = None


class FinalizeRequest(BaseModel):
    session_id: str


class FinalizeResponse(BaseModel):
    summary: Dict[str, Any]
    latest_evaluation: Dict[str, Any]
    initial_evaluation: Optional[Dict[str, Any]] = None


def _ensure_firebase_admin_initialized() -> None:
    if firebase_admin is None or firebase_auth is None:
        raise HTTPException(
            status_code=500,
            detail="firebase-admin is not installed. Run: pip install firebase-admin",
        )

    if firebase_admin._apps:
        return

    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")

    try:
        if service_account_path:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            # Uses Application Default Credentials if available.
            firebase_admin.initialize_app()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to initialize Firebase Admin SDK. "
                "Set FIREBASE_SERVICE_ACCOUNT_KEY to your service-account JSON path. "
                f"Details: {exc}"
            ),
        )


def _get_uid_from_bearer(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header.")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format.")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token.")

    _ensure_firebase_admin_initialized()

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase ID token: {exc}")

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Firebase token missing uid.")

    return uid


def _get_session_for_user(session_id: str, uid: str) -> ClinicalTutoringPipeline:
    entry = sessions.get(session_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new session.")
    if entry.get("uid") != uid:
        raise HTTPException(status_code=403, detail="Not authorized for this session.")
    return entry["pipeline"]


@app.post("/api/session/start", response_model=StartResponse)
def start_session(authorization: Optional[str] = Header(default=None)):
    uid = _get_uid_from_bearer(authorization)

    session_id = str(uuid.uuid4())
    pipeline = ClinicalTutoringPipeline()
    sessions[session_id] = {"uid": uid, "pipeline": pipeline}

    return StartResponse(session_id=session_id)


@app.post("/api/session/message", response_model=MessageResponse)
def send_message(body: MessageRequest, authorization: Optional[str] = Header(default=None)):
    uid = _get_uid_from_bearer(authorization)
    pipeline = _get_session_for_user(body.session_id, uid)

    response = pipeline.step(body.text)
    eval_packet = pipeline.state.eval_packet or {}

    return MessageResponse(
        message=response,
        metrics_status=eval_packet.get("metrics_status"),
        evaluation=eval_packet.get("evaluation"),
        done=eval_packet.get("done"),
        turns_to_meet_all_metrics=eval_packet.get("turns_to_meet_all_metrics"),
    )


@app.post("/api/session/finalize", response_model=FinalizeResponse)
def finalize_session(body: FinalizeRequest, authorization: Optional[str] = Header(default=None)):
    uid = _get_uid_from_bearer(authorization)
    pipeline = _get_session_for_user(body.session_id, uid)

    summary = pipeline.presentation_workflow.final_summary()
    latest_eval = (pipeline.state.eval_packet or {}).get("evaluation", {})
    initial_eval = pipeline.presentation_workflow.state.initial_evaluation

    return FinalizeResponse(
        summary=summary,
        latest_evaluation=latest_eval,
        initial_evaluation=initial_eval,
    )

