# MentorMD: An AI Attending Physician

MentorID is an AI attending physician that evaluates case presentations across nine key clinical competencies and generates targeted Socratic questions to help learners identify gaps in their diagnostic reasoning and patient prioritization. 

## Tech Stack

### Frontend
- React + TypeScript (Vite)
- Firebase Auth (Google sign-in)
- Cloud Firestore (profiles, case history, stats)
- Tailwind CSS + Radix UI components

### Backend
- Python 3.10+
- FastAPI + Uvicorn
- OpenAI API (student parsing, rubric evaluation, AI attending responses)
- Google Vertex AI endpoint (MedGemma packet generation)
- Firebase Admin SDK (ID token verification)
- Custom Noisy-OR Bayes network for differential diagnosis grounding

## Run the Project

Use two terminals.

### 1. Run Backend API

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

## End-to-End Flow

1. User signs in with Google on the frontend.
2. Frontend starts an authenticated backend tutoring session.
3. Student submits an initial case presentation.
4. Backend parses findings, updates Bayes evidence, builds a MedGemma packet, evaluates the presentation on 9 metrics, and generates attending feedback.
5. Iterative Socratic turns continue until metrics are met or max turns are reached.
6. Final evaluation and transcript are saved to Firestore and shown in the profile dashboard.
