import React from 'react';
import { Sparkles, DollarSign, ShieldAlert, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { JudgeEvaluation, JudgeVerdict } from '../types';

interface JudgeCardsProps {
  evaluation?: JudgeEvaluation | null;
}

export const JUDGES_CONFIG = [
  {
    id: 'ada',
    name: 'Ada',
    fullName: 'Ada Lovelace-Vance',
    role: 'PRODUCT',
    focus: 'Problem, Users, UX & Moat',
    badgeClass: 'bg-green-100 text-green-700',
    icon: Sparkles,
  },
  {
    id: 'marcus',
    name: 'Marcus',
    fullName: 'Marcus Chen',
    role: 'BUSINESS',
    focus: 'TAM, Pricing, Traction & CAC/LTV',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: DollarSign,
  },
  {
    id: 'priya',
    name: 'Priya',
    fullName: 'Priya Sharma',
    role: 'RISK',
    focus: 'Security, Compliance, IP & Scale',
    badgeClass: 'bg-purple-100 text-purple-700',
    icon: ShieldAlert,
  },
];

export const JudgeCards: React.FC<JudgeCardsProps> = ({ evaluation }) => {
  const getVerdictBadge = (verdict?: JudgeVerdict) => {
    if (!verdict) return null;
    if (verdict === 'bullish') {
      return (
        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded uppercase">
          Bullish
        </span>
      );
    }
    if (verdict === 'skeptical') {
      return (
        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded uppercase">
          Skeptical
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded uppercase">
        Neutral
      </span>
    );
  };

  return (
    <div id="board-judges-panel" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {JUDGES_CONFIG.map((judge) => {
        const judgeData = evaluation?.judges
          ? (evaluation.judges as any)[judge.id]
          : null;

        return (
          <div
            key={judge.id}
            id={`judge-card-${judge.id}`}
            className="bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all hover:border-gray-300"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">
                  {judge.name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  • {judge.fullName.split(' ')[1] || ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {getVerdictBadge(judgeData?.verdict)}
                <span className={`px-1.5 py-0.5 ${judge.badgeClass} text-[9px] font-bold rounded uppercase`}>
                  {judge.role}
                </span>
              </div>
            </div>

            {judgeData?.quote ? (
              <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">
                &lsquo;{judgeData.quote}&rsquo;
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Awaiting pitch to begin critique...
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

