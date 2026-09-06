import React from 'react';
import {
  Briefcase,
  LogIn,
  LogOut,
  PlusCircle,
  Clock,
  Trash2,
  Sliders,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  FileText,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { JudgeMode, PitchSession, AppUser } from '../types';

interface PitchSidebarProps {
  user: User | AppUser | null;
  pitch: string;
  setPitch: (val: string) => void;
  mode: JudgeMode;
  setMode: (mode: JudgeMode) => void;
  sessions: PitchSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onSignInWithGoogle: () => void;
  onSignInGuest: () => void;
  onSignOut: () => void;
  isEvaluating: boolean;
  onStartEvaluation: () => void;
  onOpenWalkthrough: () => void;
}

const PITCH_TEMPLATES = [
  {
    title: 'CyberGuard AI (Enterprise SaaS)',
    pitch: 'CyberGuard AI is an automated incident response copilot for SOC teams that eliminates 85% of false-positive triage. We run agentic forensic workflows directly inside customer VPCs without extracting proprietary code or PII. We have 4 Fortune 500 pilots at $120k ACV, 3.2x YoY pipeline growth, seeking $2M Seed at $12M cap.',
  },
  {
    title: 'FleetPulse (Autonomous Robotics)',
    pitch: 'FleetPulse manufactures retrofittable LiDAR and camera kits that turn standard warehouse forklifts into autonomous guided vehicles for 1/5th the cost of new robotics. We charge $1,500/forklift/mo. Currently deployed in 3 third-party logistics hubs with 99.8% collision-free uptime.',
  },
  {
    title: 'MediClaim Instant (HealthTech)',
    pitch: 'MediClaim provides real-time prior authorization and claim dispute resolution for outpatient dental and medical clinics using grounded medical necessity LLMs. We cut claim denial rates by 42% and take 8% of recaptured denied revenues. Gross margins are 78%.',
  },
];

export const PitchSidebar: React.FC<PitchSidebarProps> = ({
  user,
  pitch,
  setPitch,
  mode,
  setMode,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onSignInWithGoogle,
  onSignInGuest,
  onSignOut,
  isEvaluating,
  onStartEvaluation,
  onOpenWalkthrough,
}) => {
  return (
    <aside
      id="pitch-sidebar-panel"
      className="w-72 lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0"
    >
      {/* App Header & Branding */}
      <div className="p-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-xs">
              BP
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight uppercase text-gray-900 leading-none">
                Board Pitcher
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                Founder’s Arena v1.0
              </p>
            </div>
          </div>

          <button
            type="button"
            id="open-walkthrough-btn"
            onClick={onOpenWalkthrough}
            title="Open Test Cases & Verification Walkthrough"
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Main Controls & Pitch Context */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        {/* Pitch Input Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="founder-pitch-input" className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Current Pitch
            </label>
            <span className="text-[10px] text-gray-400 font-mono">
              {pitch.length}/4000
            </span>
          </div>

          <textarea
            id="founder-pitch-input"
            value={pitch}
            onChange={(e) => setPitch(e.target.value.slice(0, 4000))}
            placeholder="Describe your startup, core value prop, market, traction, and ask..."
            rows={5}
            className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-gray-800 transition-colors leading-relaxed"
          />

          {/* Quick Pitch Templates */}
          <div className="mt-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Sample Templates:
            </span>
            <div className="flex flex-wrap gap-1">
              {PITCH_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  id={`template-btn-${i}`}
                  onClick={() => setPitch(tpl.pitch)}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors cursor-pointer"
                >
                  {tpl.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Mode Toggle: Decision vs Practice */}
        <section>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-2">
            Session Mode
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              id="mode-toggle-decision"
              onClick={() => setMode('decision')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                mode === 'decision'
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Decision
            </button>
            <button
              type="button"
              id="mode-toggle-practice"
              onClick={() => setMode('practice')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                mode === 'practice'
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Practice
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            {mode === 'decision'
              ? 'Board aims for a definitive ACCEPT or REJECT investment verdict.'
              : 'Judges act as sharp mentors stress-testing flaws without a final vote.'}
          </p>
        </section>

        {/* Primary Action Button */}
        <section>
          <button
            type="button"
            id="start-evaluation-btn"
            disabled={isEvaluating || !pitch.trim()}
            onClick={onStartEvaluation}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              isEvaluating || !pitch.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEvaluating ? 'Deliberating...' : 'Pitch to the Board'}
          </button>
        </section>

        {/* Recent Sessions List */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase">
              Recent Sessions
            </label>
            <button
              type="button"
              id="new-pitch-session-btn"
              onClick={onNewSession}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              New
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-2">
              No saved sessions yet. Pitch to start.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {sessions.map((s) => {
                const isSelected = s.id === currentSessionId;
                return (
                  <div
                    key={s.id}
                    id={`session-item-${s.id}`}
                    onClick={() => onSelectSession(s.id)}
                    className={`p-2 text-xs rounded-md transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'border border-indigo-100 bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="truncate">
                        {s.title || 'Untitled Pitch'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] uppercase font-bold text-gray-400">
                          {s.decision}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      id={`delete-session-${s.id}`}
                      onClick={(e) => onDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-600 p-0.5 rounded transition-opacity cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* User Auth Bar at Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                  {(user.displayName || user.email || 'F')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {user.displayName || (user.isAnonymous ? 'Guest Founder' : user.email?.split('@')[0])}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 truncate">
                    {user.isAnonymous ? 'Guest Mode' : 'Google Auth'}
                  </span>
                  {user.isAnonymous && (
                    <button
                      type="button"
                      id="upgrade-google-auth-btn"
                      onClick={onSignInWithGoogle}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              id="sign-out-btn"
              onClick={onSignOut}
              title="Sign out or reset"
              className="text-[10px] text-gray-400 uppercase font-bold hover:text-red-500 cursor-pointer transition-colors shrink-0 ml-1"
            >
              Reset
            </button>
          </>
        ) : (
          <div className="w-full space-y-1.5">
            <button
              type="button"
              id="google-signin-btn"
              onClick={onSignInWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in with Google
            </button>
            <button
              type="button"
              id="guest-signin-btn"
              onClick={onSignInGuest}
              className="w-full text-center text-[10px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              or continue as Guest Founder
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
