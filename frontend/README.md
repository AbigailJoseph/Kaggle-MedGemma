# Frontend

React + Vite client for MedGemma clinical training.

## Responsibilities

- Google sign-in/sign-out via Firebase Auth
- Case flow UI (`home -> case -> chat -> evaluation -> profile`)
- Profile analytics and case history display
- Firestore persistence for completed cases and derived training stats

## Key Files

- `src/app/App.tsx`: App shell, local routing, auth wiring, Firestore persistence
- `src/app/components/HomePage.tsx`: Landing page and entry actions
- `src/app/components/CaseScreen.tsx`: Initial presentation capture
- `src/app/components/ChatScreen.tsx`: Multi-turn student-attending interaction UI
- `src/app/components/EvaluationPage.tsx`: Final rubric/evaluation summary
- `src/app/components/ProfilePage.tsx`: Profile dashboard, history, achievements
- `src/lib/firebase.ts`: Firebase app/auth/firestore initialization

## Environment Variables

Create `frontend/.env` (or `.env.local`) with:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)
- `VITE_API_BASE_URL` (if your chat client supports configurable backend URL)

## Run Locally

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:5173`

## Notes on `ui/` Components

`src/app/components/ui/*` contains reusable/generated UI primitives.
They are mostly low-level presentational wrappers and are intentionally thin.
Project-specific behavior and business logic live in `App.tsx` and feature pages.
