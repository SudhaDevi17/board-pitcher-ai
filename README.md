# Board Pitcher 🦈

> **Board Pitcher** simulates an AI-powered investor board (Shark Tank style) for startup founders to practice, defend, refine, and stress-test their pitch with three distinct investor personas.

---

## 🏛️ Meet the Investor Board

The panel features three distinct judges:
1. **Ada Lovelace-Vance (Product Judge)**: Former VP of Product at Stripe. Evaluates problem clarity, user definitions, UX workflows, customer pain, and product defensibility/moat.
2. **Marcus Chen (Business Judge)**: Partner at Benchmark. Evaluates TAM/SAM/SOM market size, pricing model, unit economics, CAC/LTV, sales velocity, traction metrics, and venture scalability.
3. **Priya Sharma (Risk Judge)**: Former Enterprise CISO. Evaluates cybersecurity posture, regulatory compliance (GDPR/HIPAA/SOC2), architecture debt, execution risks, and enterprise liabilities.

---

## 🛡️ Agentic Threat Model & Security Posture

### Threat Summary Matrix (The 5 Threat Zones)

| Threat Zone | Identified Vectors | Countermeasures & Architectural Defense |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Buffer exhaustion, prompt injection to force false ACCEPT verdicts, malicious pitch content | Strict input truncation (max 4,000 characters), input sanitization, and structured delimitation preventing prompt breakout. |
| **2. Planning & Reasoning** | System instruction bypass, persona hijacking, scorecard manipulation | Immutable system instructions with rigid JSON schema enforcement, multi-judge independent evaluation, and scoring protocol boundaries. |
| **3. Tool & Server Execution** | Unauthorized API calls, SSRF, dynamic code evaluation | Server-side Gemini API invocation only; strict Firebase ID token verification; zero API keys or secrets on the frontend. |
| **4. Memory & State** | Cross-tenant data leakage, session tampering, unauthorized reads/writes | Path scoping to `users/{userId}/pitchSessions/{sessionId}`; hardened Firestore security rules (`request.auth.uid == userId`); undefined-stripping payload sanitization. |
| **5. Inter-System Communication** | Gemini API key leakage, ID token interception | Google Cloud Secret Manager integration with least-privilege IAM; zero secret logging; resilient model fallback ladder. |

---

## 🚀 Core Features

- **Firebase Authentication**: Sign in with Google with user data isolation (plus instant Guest Founder preview option).
- **Multi-Turn Interrogation**: Rebuttal flow answering judge questions and defending economics.
- **Two Operating Modes**:
  - **Decision Mode**: Board pushes for a definitive **ACCEPT** or **REJECT** investment decision.
  - **Practice Mode**: Intense coaching and stress-testing without an immediate investment vote.
- **7-Metric Scoreboard (1–10 Scale)**:
  - Problem Clarity
  - Market Opportunity
  - Moat / Defensibility
  - Business Model
  - Traction / Proof
  - Team Execution
  - Security & Risk (10 = Lowest Risk)
- **High-Impact Decisions**:
  - **ACCEPT**: Investment thesis, term sheet offer extended, and **Investable Pitch Rewrite (Gold Standard)** with one-click copy.
  - **REJECT**: Clear reasons for passing today, with specific actionable improvements needed before the next meeting.
- **Durable Firestore Persistence**: Sessions and message logs persisted per user under `users/{uid}/pitchSessions/{sessionId}`.
- **Secret Manager Integration**: Server retrieves `GEMINI_API_KEY` from Google Cloud Secret Manager.
- **Resilient Gemini Fallback Ladder**: Automatically retries across `gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-flash-latest` -> `gemini-3.7-flash` on transient errors.

---

## 📋 Prerequisites & Local Development

### 1. Prerequisites
- Node.js 20+ installed
- Google Cloud CLI (`gcloud`) installed & authenticated
- A Firebase project with Firestore and Authentication enabled

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY` or configure Google Cloud Secret Manager.

### 4. Run Development Server
```bash
npm run dev
```
The full-stack application will be live at `http://localhost:3000`.

---

## 🔒 Firestore Security Rules

Deploy these rules to ensure absolute user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /pitchSessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

---

## 🔐 Google Cloud Secret Manager Setup

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create the GEMINI_API_KEY secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 3. Add your Gemini API key value
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 4. Grant Cloud Run default compute service account read access
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚢 Google Cloud Run Deployment

### 1. Build and Deploy Container
```bash
# Set your target project and region
gcloud config set project YOUR_PROJECT_ID
REGION="us-central1"
SERVICE_NAME="board-pitcher"

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT_ID \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### 2. Apply Challenge Campaign Verification Label
```bash
gcloud run services update board-pitcher \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 🧪 Functional Test Walkthrough Matrix

The application includes an in-app **Verification & Functional Test Walkthrough Modal** (accessible via the shield icon in the sidebar). You can also run these test cases manually:

| Test ID | Test Scenario | Steps to Execute | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | **User Sign-In & Isolation** | 1. Click "Sign in with Google" or "Guest Founder".<br>2. Check top of sidebar for user profile badge. | User authenticated; sessions scoped to `users/{uid}/pitchSessions`. |
| **TC-02** | **Initial Pitch Evaluation** | 1. Select template or enter pitch.<br>2. Click "Pitch to the Board". | 3 judges respond with individual quotes, critique, and 7-metric scorecard. |
| **TC-03** | **Practice Mode Coaching** | 1. Switch toggle to "Practice Mode".<br>2. Submit pitch. | Verdict shows PRACTICE banner; judges provide tactical interrogation without a final vote. |
| **TC-04** | **Rebuttal & Defense** | 1. Click "Answer" on an investor question chip or click "Defend Economics".<br>2. Press Enter to submit. | Judges review defense, update critiques and score meters. |
| **TC-05** | **Call for Final Vote (Decision)** | 1. Click "Call for Final Vote" action chip.<br>2. Wait for deliberation. | Verdict resolves to **ACCEPT** (with rewritten gold pitch) or **REJECT** (with required fixes). |
| **TC-06** | **Pitch Session Persistence** | 1. Click "New" session in sidebar.<br>2. Click previously saved session. | Conversation history, scores, and decision reload instantly without data loss. |
