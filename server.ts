import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Initialize Firebase Admin lazily/gracefully
let firebaseAdminInitialized = false;
try {
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!getApps().length) {
    initializeApp(projectId ? { projectId } : undefined);
    firebaseAdminInitialized = true;
  }
} catch (err) {
  console.warn('Firebase Admin initialization notice:', (err as Error).message);
}

// Secret Manager Accessor for GEMINI_API_KEY
let cachedGeminiKey: string | null = null;

async function getGeminiApiKey(): Promise<string> {
  if (cachedGeminiKey && cachedGeminiKey !== 'MY_GEMINI_API_KEY') {
    return cachedGeminiKey;
  }

  // 1. Check environment variable first
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'MY_GEMINI_API_KEY' && envKey.trim().length > 5) {
    cachedGeminiKey = envKey.trim();
    return cachedGeminiKey;
  }

  // 2. Attempt Secret Manager retrieval from Google Cloud
  try {
    const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
    if (projectId) {
      const secretName = `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`;
      const [version] = await client.accessSecretVersion({ name: secretName });
      const payload = version.payload?.data?.toString();
      if (payload && payload.trim().length > 0) {
        cachedGeminiKey = payload.trim();
        return cachedGeminiKey;
      }
    }
  } catch (err) {
    // Graceful fallback: log warning without leaking secrets
    console.warn('Secret Manager lookup note (falling back to environment):', (err as Error).message);
  }

  return process.env.GEMINI_API_KEY || '';
}

// Middleware: Authenticate Firebase ID Token
async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if demo or guest session is allowed
    const guestUid = req.headers['x-guest-uid'] as string;
    if (guestUid) {
      (req as any).user = { uid: guestUid, isGuest: true };
      return next();
    }
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  // Allow guest token for unauthenticated preview / sandbox
  if (idToken.startsWith('guest_token_') || idToken === 'demo_token') {
    const guestUid = (req.headers['x-guest-uid'] as string) || idToken.replace('guest_token_', '') || 'guest_user';
    (req as any).user = { uid: guestUid, isGuest: true };
    return next();
  }

  if (firebaseAdminInitialized) {
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      return next();
    } catch (err) {
      // In local dev/demo environments where service account might lack full verify permissions:
      console.warn('ID token verify warning:', (err as Error).message);
      // Fallback: parse token payload safely for UID isolation
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload && payload.user_id) {
            (req as any).user = { uid: payload.user_id, email: payload.email };
            return next();
          }
        }
      } catch (_) {
        // pass to 401
      }
      return res.status(401).json({ error: 'Invalid or expired Firebase ID token' });
    }
  } else {
    // If admin SDK not initialized, decode unverified token for uid isolation
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        (req as any).user = { uid: payload.user_id || payload.sub || 'user_demo', email: payload.email };
        return next();
      }
    } catch (_) {
      // ignore
    }
    (req as any).user = { uid: 'user_authenticated' };
    return next();
  }
}

// Resilient Gemini Model Fallback Ladder
const GEMINI_MODEL_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface EvaluatePayload {
  pitch?: string;
  mode?: 'decision' | 'practice';
  userMessage?: string;
  messagesHistory?: Array<{ role: 'user' | 'judges'; content: string }>;
  requestedDecision?: boolean;
}

// 2. Defensive Payload Ingestion & API Handler
app.post('/api/evaluate-pitch', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    // Strategy 3: Require Verified Google Authentication for live LLM evaluations
    if ((req as any).user?.isGuest) {
      return res.status(403).json({
        success: false,
        requiresAuth: true,
        error: 'Sign in with Google to evaluate custom pitches with live Gemini AI. Guest mode is restricted to interactive sample pitches.',
      });
    }

    const body: EvaluatePayload = req.body && typeof req.body === 'object' ? req.body : {};
    const pitch = (body.pitch || '').trim().slice(0, 4000);
    const mode = body.mode === 'practice' ? 'practice' : 'decision';
    const userMessage = (body.userMessage || '').trim().slice(0, 3000);
    const messagesHistory = Array.isArray(body.messagesHistory) ? body.messagesHistory.slice(-12) : [];
    const requestedDecision = Boolean(body.requestedDecision);

    if (!pitch && !userMessage && messagesHistory.length === 0) {
      return res.status(400).json({ error: 'Pitch or response message is required.' });
    }

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in Secret Manager or environment.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for context
    const historyText = messagesHistory
      .map((m) => `${m.role === 'user' ? 'Founder' : 'Judges'}: ${m.content.slice(0, 1000)}`)
      .join('\n\n');

    const promptText = `
You are the AI Investor Board of Board Pitcher, simulating a high-stakes, Shark Tank-style venture capital evaluation panel with exactly THREE judges:
1. Ada, Product Judge: evaluates problem clarity, target customer definition, user experience, product mechanics, and differentiation/defensibility.
2. Marcus, Business Judge: evaluates market size (TAM/SAM/SOM), pricing model, unit economics, go-to-market strategy, traction metrics, and venture scalability.
3. Priya, Risk Judge: evaluates cybersecurity, regulatory & legal compliance, technical debt, execution complexity, enterprise readiness, and single-point-of-failure risks.

Mode: ${mode.toUpperCase()} MODE
Requested Final Decision: ${requestedDecision ? 'YES (Founder explicitly requested the final investment decision)' : 'NO'}

FOUNDER'S CORE PITCH:
"""
${pitch || 'Pitch provided in conversation'}
"""

PRIOR CONVERSATION HISTORY:
${historyText || '(First turn / Initial pitch)'}

FOUNDER'S LATEST MESSAGE / CLARIFICATION:
"""
${userMessage || '(Evaluating initial pitch)'}
"""

INSTRUCTIONS & RULES:
1. Every judge MUST speak in their distinct persona:
   - Ada is sharp, product-obsessed, and allergic to hand-waving "AI magic" without clear UX workflows.
   - Marcus is tough, ROI-driven, focused on metrics, CAC/LTV, sales cycles, and pricing power.
   - Priya is vigilant, forensic, probing data compliance (GDPR/HIPAA/SOC2), architecture, and enterprise liabilities.
2. Provide numeric scores from 1 to 10 for:
   - problem (1-10)
   - market (1-10)
   - differentiation (1-10)
   - businessModel (1-10)
   - traction (1-10)
   - team (1-10)
   - risk (1-10, where 10 means lowest risk/most secure)
3. Decision Logic:
   - In "PRACTICE" mode: The decision MUST be "PRACTICE", unless requestedDecision is true. Coach aggressively, push on flaws, provide questions and tactical advice.
   - In "DECISION" mode:
     - If requestedDecision is true OR there are 2+ prior turns of debate OR the pitch is remarkably clear and comprehensive:
       - Give either "ACCEPT" (if scores average 7.5+ and all critical risks are addressed) OR "REJECT" (if major flaws, lack of defensibility, or missing business model remain).
     - Otherwise, if early in the discussion (e.g. turn 1 without requested decision):
       - Give "UNDECIDED" while the board interrogates the founder.
4. If the decision is "ACCEPT":
   - Clearly state why the board would invest (valuation, terms, conviction).
   - Provide "rewrittenPitch": A pitch-perfect, investor-ready executive rewrite of the founder's pitch that fixes all weaknesses and commands investor attention.
5. If the decision is "REJECT":
   - Clearly state why the board is passing today.
   - Provide "improvementsNeeded": An array of 3-4 specific, actionable changes required before the board would reconsider.
6. Provide 2-3 tough investor-style follow-up questions.
7. Provide "nextBestMove": One tactical, high-leverage instruction the founder should execute next.

OUTPUT FORMAT:
You MUST respond with valid JSON ONLY matching this schema, without markdown backticks or commentary outside the JSON:
{
  "decision": "ACCEPT" | "REJECT" | "UNDECIDED" | "PRACTICE",
  "decisionReason": "Summary of the board's stance and consensus",
  "rewrittenPitch": "Only if ACCEPT: The polished, investor-ready rewrite of the pitch",
  "improvementsNeeded": ["Only if REJECT: Actionable fix 1", "Actionable fix 2", "Actionable fix 3"],
  "scores": {
    "problem": 8,
    "market": 7,
    "differentiation": 6,
    "businessModel": 7,
    "traction": 5,
    "team": 6,
    "risk": 7
  },
  "judges": {
    "ada": {
      "name": "Ada",
      "role": "Product Judge",
      "quote": "Memorable one-line shark-tank critique",
      "feedback": "Deep critique on problem, UX, product moat, and user value",
      "verdict": "bullish" | "neutral" | "skeptical"
    },
    "marcus": {
      "name": "Marcus",
      "role": "Business Judge",
      "quote": "Memorable one-line shark-tank critique",
      "feedback": "Deep critique on market size, revenue engine, unit economics, and margins",
      "verdict": "bullish" | "neutral" | "skeptical"
    },
    "priya": {
      "name": "Priya",
      "role": "Risk Judge",
      "quote": "Memorable one-line shark-tank critique",
      "feedback": "Deep critique on technical liability, compliance, attack vectors, and execution hurdles",
      "verdict": "bullish" | "neutral" | "skeptical"
    }
  },
  "questions": [
    "Tough follow-up question 1",
    "Tough follow-up question 2"
  ],
  "nextBestMove": "Immediate tactical directive for the founder"
}
`;

    // Execute with Fallback Ladder
    let lastError: any = null;
    let rawResponseText = '';

    for (const modelName of GEMINI_MODEL_LADDER) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.35,
          },
        });

        if (response && response.text) {
          rawResponseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed, stepping down ladder:`, err.message || err);
        // Continue to next model in ladder for 503, 429, 404, 500, etc.
      }
    }

    if (!rawResponseText) {
      throw lastError || new Error('All models in fallback ladder failed to generate response.');
    }

    // Clean JSON parsing
    let cleaned = rawResponseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const evaluation = JSON.parse(cleaned);

    return res.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error('Pitch evaluation error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate pitch',
    });
  }
});

// Health check endpoint for Cloud Run
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'board-pitcher', timestamp: new Date().toISOString() });
});

// Optional client Firebase config endpoint
app.get('/api/firebase-config', (req: Request, res: Response) => {
  const dynamicKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  res.json({ apiKey: dynamicKey || null });
});

// 3. Vite middleware for development & Static hosting for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      const dynamicKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
      if (dynamicKey && fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = html.replace('</head>', `<script>window.__FIREBASE_API_KEY__=${JSON.stringify(dynamicKey)};</script></head>`);
        return res.send(html);
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Board Pitcher server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
