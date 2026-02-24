# MentorMD: An AI Attending Physician

MentorMD is an AI attending physician platform for clinical case-presentation training.

It takes a student's presentation, evaluates it against a 9-metric rubric, asks targeted Socratic follow-up questions, and tracks improvement across turns while storing user progress in Firebase.

## Live Demo

Deployed website: https://abigailjoseph.github.io/Kaggle-MedGemma/

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Firebase Auth (Google sign-in)
- Cloud Firestore (profiles, completed cases, stats)

### Backend
- Python 3.10+
- FastAPI + Uvicorn
- OpenAI API (student parser, rubric evaluator, AI attending)
- Google Vertex AI endpoint (MedGemma prompt packet)
- Firebase Admin SDK (ID token verification)
- Custom Noisy-OR Bayes network for differential reasoning

## Quick Start (Local Development)

Create `backend/.env` and `frontend/.env`, then run in two terminals:

### 1. Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### 2. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## What The System Does

- Accepts a student's initial case presentation.
- Extracts likely symptoms/diagnoses from free text.
- Uses a Noisy-OR Bayes network to ground the differential.
- Generates a MedGemma knowledge packet from grounded context.
- Evaluates presentation quality across 9 clinical communication/reasoning metrics.
- Produces attending-style coaching plus one targeted question per turn.
- Stores case outcomes, transcript, and profile stats for longitudinal learning.

## Repository Structure 

```text
.
|-- README.md                                 
|-- render.yaml                               
|-- medgemma_client.py                        # Legacy standalone MedGemma test client script
|-- docs/
|   |-- system-diagram.png                    # High-level system diagram image
|   `-- system-diagram/
|       `-- README.md                         # Diagram explanation and data-flow notes
|-- backend/
|   |-- main.py                               # CLI entrypoint for local tutoring session
|   |-- server.py                             # FastAPI API (start session, message, finalize)
|   |-- requirements.txt                      # Python dependencies
|   |-- medgemma_client.py                    # Backend MedGemma Vertex endpoint wrapper
|   |-- agents/
|   |   `-- ai_attending.py                   # Attending-style coaching response generator
|   |-- parsing/
|   |   `-- student_parser.py                 # Extracts symptoms/differential from student text
|   |-- pipeline/
|   |   |-- pipeline.py                       # Main orchestration: parse -> infer -> evaluate -> respond
|   |   `-- state.py                          # Conversation state dataclass across turns
|   |-- evaluation/
|   |   |-- presentation_workflow.py          # 9-metric rubric evaluation + Socratic question loop
|   |   `-- diagnosis_evaluator.py            # Checks diagnosis support against Bayes outputs
|   `-- bayes/
|       |-- noisy_or_bayesnet.py              # Noisy-OR Bayesian inference engine
|       |-- network_data.py                   # Disease/symptom priors and conditional probabilities
|       |-- demo.py                           # Bayes demo script
|       `-- data/sample_ehr.json              # Sample data for experimentation
`-- frontend/
    |-- README.md                             # Frontend-specific setup details
    |-- package.json                          # Node scripts/dependencies
    |-- vite.config.ts                        # Vite build/dev config
    |-- index.html                            # Frontend HTML entry
    `-- src/
        |-- main.tsx                          # React mount point
        |-- lib/firebase.ts                   # Firebase client initialization
        |-- app/App.tsx                       # App shell, screen flow, auth + Firestore orchestration
        |-- app/components/HomePage.tsx       # Landing page
        |-- app/components/CaseScreen.tsx     # Initial case presentation input
        |-- app/components/ChatScreen.tsx     # Interactive tutoring chat UI
        |-- app/components/EvaluationPage.tsx # Final feedback/results page
        |-- app/components/ProfilePage.tsx    # User profile, history, progress dashboard
        `-- app/components/ui/*               # Reusable UI primitives (presentational components)
```

## System Diagram

- Diagram image: `docs/system-diagram.png`
- Detailed walkthrough: `docs/system-diagram/README.md`

## High-Level Flow

1. Frontend authenticates with Firebase and starts a backend session.
2. Backend parses presentation text and updates Bayes evidence.
3. Backend calls MedGemma with grounded prompt context.
4. Backend evaluates the student presentation using the 9-metric rubric.
5. AI attending returns concise feedback plus targeted follow-up.
6. Frontend saves final case results/transcript to Firestore.
