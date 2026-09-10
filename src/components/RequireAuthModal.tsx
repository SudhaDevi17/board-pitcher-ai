import React from 'react';
import { LogIn, Sparkles, ShieldCheck, History, X } from 'lucide-react';

interface RequireAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWithGoogle: () => void;
  actionAttempted?: string;
}

export const RequireAuthModal: React.FC<RequireAuthModalProps> = ({
  isOpen,
  onClose,
  onSignInWithGoogle,
  actionAttempted = 'evaluate custom pitches',
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="require-auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="require-auth-modal-content"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100/60 relative">
          <button
            type="button"
            id="close-require-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Sign In with Google to Grill Your Pitch
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Guest mode allows exploring interactive sample pitches. To {actionAttempted} and unlock live Gemini AI deliberation, sign in with your Google account.
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-3 bg-white">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Live Board Deliberation</p>
              <p className="text-[11px] text-gray-500">Unfiltered multi-turn feedback from Ada (Product), Marcus (Business), and Priya (Risk).</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Custom Scorecard & Strategy</p>
              <p className="text-[11px] text-gray-500">Comprehensive radar analysis across 7 vectors and tactical next best move.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Private Firestore History</p>
              <p className="text-[11px] text-gray-500">Save, revisit, and iterate on past pitch sessions securely across devices.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
          <button
            type="button"
            id="modal-google-signin-btn"
            onClick={() => {
              onClose();
              onSignInWithGoogle();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Google
          </button>

          <button
            type="button"
            id="modal-continue-guest-btn"
            onClick={onClose}
            className="w-full text-center py-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Continue exploring sample pitches as guest
          </button>
        </div>
      </div>
    </div>
  );
};
