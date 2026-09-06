import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Play,
  ShieldCheck,
  FileCheck,
  Database,
  Lock,
  Target,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenarioType: string) => void;
}

interface TestCase {
  id: string;
  category: string;
  name: string;
  objective: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  securityZone: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Authentication & Isolation',
    name: 'Firebase Auth & User Data Isolation',
    objective: 'Ensure pitch sessions are strictly scoped to the authenticated user UID.',
    preconditions: 'User visits the applet and clicks Google Sign-In or Guest Demo.',
    steps: [
      '1. Trigger sign-in via Google popup or Guest Auth.',
      '2. Verify user token is passed in Authorization header.',
      '3. Verify session document is stored at users/{uid}/pitchSessions/{sessionId}.',
      '4. Verify Firestore security rules deny access to any other user UID.',
    ],
    expectedResult: 'Pitch data persists exclusively inside the owner user UID path.',
    securityZone: 'Memory & State / Broken Access Control (OWASP A01)',
  },
  {
    id: 'TC-02',
    category: '3-Judge Deliberation',
    name: 'Multi-Judge Persona & Scorecard Verification',
    objective: 'Verify that Ada (Product), Marcus (Business), and Priya (Risk) evaluate with distinct personas and a 7-metric scorecard.',
    preconditions: 'User inputs an initial pitch or selects a template.',
    steps: [
      '1. Paste pitch into the left panel input area.',
      '2. Click "Pitch to the Board".',
      '3. Inspect responses for Ada, Marcus, and Priya.',
      '4. Verify 1-10 scores for problem, market, differentiation, businessModel, traction, team, and risk.',
    ],
    expectedResult: 'All 3 judges render individual quotes, critiques, status tags, and numeric scores.',
    securityZone: 'Planning & Reasoning (OWASP LLM01/LLM02)',
  },
  {
    id: 'TC-03',
    category: 'Mode Operation',
    name: 'Decision Mode vs. Practice Mode Enforcement',
    objective: 'Validate that Practice Mode provides aggressive coaching without deciding, while Decision Mode reaches ACCEPT/REJECT.',
    preconditions: 'Pitch entered.',
    steps: [
      '1. Switch toggle to "Practice Mode" and submit pitch.',
      '2. Verify decision status is PRACTICE with coaching feedback.',
      '3. Switch toggle to "Decision Mode" and click "Call for Final Vote".',
      '4. Verify verdict resolves to ACCEPT or REJECT.',
    ],
    expectedResult: 'Board respects the mode parameter and provides appropriate verdict banners.',
    securityZone: 'Tool & Server Execution Logic',
  },
  {
    id: 'TC-04',
    category: 'Pitch Rewrite & Remedies',
    name: 'ACCEPT Pitch Rewrite & REJECT Actionable Remedies',
    objective: 'Confirm that an ACCEPT verdict rewrites the pitch into an investable version, and REJECT lists actionable fixes.',
    preconditions: 'A final investment vote has settled.',
    steps: [
      '1. For ACCEPT: verify gold-standard rewritten pitch card with copy button.',
      '2. Click "Copy Pitch" and check clipboard.',
      '3. For REJECT: verify specific improvement list items.',
    ],
    expectedResult: 'Founder receives actionable next moves or complete rewritten pitch ready for investors.',
    securityZone: 'Output Handling & Sanitization (OWASP LLM05)',
  },
  {
    id: 'TC-05',
    category: 'Persistence & Session History',
    name: 'Firestore Pitch Session Persistence & Recovery',
    objective: 'Verify pitch sessions, evaluations, and multi-turn chat history persist across refreshes.',
    preconditions: 'At least one pitch evaluation completed.',
    steps: [
      '1. Check saved sessions list in left sidebar.',
      '2. Click "New Pitch Session" to reset screen.',
      '3. Click on previous saved session in list.',
      '4. Delete session via trash icon and confirm removal.',
    ],
    expectedResult: 'Sessions load with all chat turns and latest scorecards without data loss.',
    securityZone: 'Memory & State / Firestore Transaction Integrity',
  },
  {
    id: 'TC-06',
    category: 'Secret Management & Backend Safety',
    name: 'Server-Side Secret Manager & Zero Client Keys',
    objective: 'Ensure GEMINI_API_KEY is retrieved on the server side via Secret Manager / environment and never exposed to the client.',
    preconditions: 'Inspect browser devtools network tab during evaluation.',
    steps: [
      '1. Monitor network requests to /api/evaluate-pitch.',
      '2. Inspect request and response headers and bodies.',
      '3. Verify no GEMINI_API_KEY is sent to or from the browser.',
      '4. Verify server logs truncate user input and do not log full tokens.',
    ],
    expectedResult: 'Zero hardcoded secrets in frontend bundle; API keys remain strictly server-side.',
    securityZone: 'Inter-System Communication / Secret Management',
  },
];

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onRunScenario,
}) => {
  const [selectedCase, setSelectedCase] = useState<TestCase>(TEST_CASES[0]);

  if (!isOpen) return null;

  return (
    <div
      id="walkthrough-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="walkthrough-modal-content"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Verification & Functional Test Walkthrough
              </h2>
              <p className="text-xs text-gray-400">
                Comprehensive step-by-step test matrix for Hackathon Evaluators & Automated Test Suites
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-walkthrough-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Test Case Selection List */}
          <div className="p-3 overflow-y-auto space-y-1.5 bg-gray-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-2 py-1">
              Test Cases ({TEST_CASES.length})
            </span>
            {TEST_CASES.map((tc) => {
              const isSelected = selectedCase.id === tc.id;
              return (
                <button
                  key={tc.id}
                  type="button"
                  id={`select-tc-${tc.id}`}
                  onClick={() => setSelectedCase(tc)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {tc.id}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-100 text-gray-600'}`}>
                      {tc.category.split(' ')[0]}
                    </span>
                  </div>
                  <p className="truncate mt-1 font-medium">{tc.name}</p>
                </button>
              );
            })}
          </div>

          {/* Test Case Details */}
          <div className="col-span-2 p-5 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {selectedCase.id}: {selectedCase.category}
                </span>
                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  {selectedCase.securityZone}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                {selectedCase.name}
              </h3>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <strong className="text-gray-800 font-semibold block mb-0.5">Objective:</strong>
              <p className="text-gray-600 leading-relaxed">{selectedCase.objective}</p>
              <strong className="text-gray-800 font-semibold block mt-2 mb-0.5">Preconditions:</strong>
              <p className="text-gray-600 leading-relaxed">{selectedCase.preconditions}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Execution Steps:
              </h4>
              <ol className="space-y-1.5">
                {selectedCase.steps.map((step, idx) => (
                  <li key={idx} className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs font-mono text-[11px]">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-xs">
              <strong className="text-green-900 font-semibold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                Expected Outcome:
              </strong>
              <p className="text-green-800 leading-relaxed">{selectedCase.expectedResult}</p>
            </div>

            {/* Scenario Quick-Launch */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                id={`run-scenario-${selectedCase.id}`}
                onClick={() => {
                  onRunScenario(selectedCase.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3 h-3 text-white" />
                Load Preset for This Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
