/**
 * Board Pitcher - Types & Interfaces
 */

export type JudgeMode = 'decision' | 'practice';

export type JudgeDecision = 'ACCEPT' | 'REJECT' | 'UNDECIDED' | 'PRACTICE';

export type JudgeVerdict = 'bullish' | 'neutral' | 'skeptical';

export interface JudgeScorecard {
  problem: number; // 1-10
  market: number; // 1-10
  differentiation: number; // 1-10
  businessModel: number; // 1-10
  traction: number; // 1-10
  team: number; // 1-10
  risk: number; // 1-10
}

export interface JudgeCommentary {
  name: 'Ada' | 'Marcus' | 'Priya' | string;
  role: string;
  quote: string;
  feedback: string;
  verdict: JudgeVerdict;
}

export interface JudgeEvaluation {
  decision: JudgeDecision;
  decisionReason: string;
  rewrittenPitch?: string;
  improvementsNeeded?: string[];
  scores: JudgeScorecard;
  judges: {
    ada: JudgeCommentary;
    marcus: JudgeCommentary;
    priya: JudgeCommentary;
  };
  questions: string[];
  nextBestMove: string;
  summaryMarkdown?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'judges';
  content: string;
  evaluation?: JudgeEvaluation;
  timestamp: string;
}

export interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous: boolean;
}

export interface PitchSession {
  id: string;
  userId: string;
  title: string;
  pitch: string;
  mode: JudgeMode;
  decision: JudgeDecision;
  latestScores?: JudgeScorecard;
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
}

export interface EvaluatePitchRequest {
  pitch: string;
  mode: JudgeMode;
  userMessage?: string;
  messagesHistory?: { role: 'user' | 'judges'; content: string }[];
  requestedDecision?: boolean;
}

export interface EvaluatePitchResponse {
  success: boolean;
  evaluation: JudgeEvaluation;
  error?: string;
}
