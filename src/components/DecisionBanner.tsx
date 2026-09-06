import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Dumbbell, Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { JudgeEvaluation } from '../types';

interface DecisionBannerProps {
  evaluation: JudgeEvaluation;
}

export const DecisionBanner: React.FC<DecisionBannerProps> = ({ evaluation }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (evaluation.decision === 'ACCEPT') {
    return (
      <div
        id="decision-banner-accept"
        className="rounded-xl border border-green-200 bg-white p-5 shadow-xs mb-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Board Verdict: Accept
                </span>
                <span className="text-xs text-gray-400 font-medium">• Term Sheet Offer Extended</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                The Board Has Voted: We Are Investing
              </h3>
            </div>
          </div>
        </div>

        {evaluation.decisionReason && (
          <div className="mt-3 text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-lg border border-gray-100">
            <span className="text-gray-900 font-bold block mb-1">Investment Thesis:</span>
            {evaluation.decisionReason}
          </div>
        )}

        {evaluation.rewrittenPitch && (
          <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                  Investor-Ready Pitch Rewrite (Gold Standard)
                </h4>
              </div>
              <button
                type="button"
                id="copy-rewritten-pitch-btn"
                onClick={() => copyToClipboard(evaluation.rewrittenPitch || '')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Pitch'}
              </button>
            </div>
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-gray-200 font-sans">
              {evaluation.rewrittenPitch}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (evaluation.decision === 'REJECT') {
    return (
      <div
        id="decision-banner-reject"
        className="rounded-xl border border-red-200 bg-white p-5 shadow-xs mb-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Board Verdict: Reject
                </span>
                <span className="text-xs text-gray-400 font-medium">• No Deal Today</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                The Board Passes: Not Ready for Investment
              </h3>
            </div>
          </div>
        </div>

        {evaluation.decisionReason && (
          <div className="mt-3 text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-lg border border-gray-100">
            <span className="text-gray-900 font-bold block mb-1">Board Consensus:</span>
            {evaluation.decisionReason}
          </div>
        )}

        {evaluation.improvementsNeeded && evaluation.improvementsNeeded.length > 0 && (
          <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                Critical Improvements Required
              </h4>
            </div>
            <ul className="space-y-1.5">
              {evaluation.improvementsNeeded.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (evaluation.decision === 'PRACTICE') {
    return (
      <div
        id="decision-banner-practice"
        className="rounded-xl border border-gray-200 bg-white p-4 mb-4 flex items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Practice Mode Active
              </span>
              <span className="text-[11px] text-gray-400">• Judges stress-testing without formal vote</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {evaluation.decisionReason || 'Refine your narrative, test defenses, and call for a final decision when ready.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // UNDECIDED
  return (
    <div
      id="decision-banner-undecided"
      className="rounded-xl border border-yellow-200 bg-white p-4 mb-4 flex items-center justify-between gap-3 shadow-xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-yellow-600 text-white flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-800">
              Board Deliberating — More Clarification Needed
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {evaluation.decisionReason || 'Judges are actively evaluating. Address the questions below to push for an investment vote.'}
          </p>
        </div>
      </div>
    </div>
  );
};

