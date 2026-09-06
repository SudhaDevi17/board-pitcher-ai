import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { JudgeScorecard } from '../types';

interface ScoreboardProps {
  scores?: JudgeScorecard | null;
}

const SCORE_LABELS: Array<{ key: keyof JudgeScorecard; label: string; desc: string }> = [
  { key: 'problem', label: 'Problem Clarity', desc: 'Real pain point' },
  { key: 'market', label: 'Market Opportunity', desc: 'TAM & expansion' },
  { key: 'differentiation', label: 'Moat / Defensibility', desc: 'Unique edge' },
  { key: 'businessModel', label: 'Business Model', desc: 'Pricing & margins' },
  { key: 'traction', label: 'Traction / Proof', desc: 'Users & revenue' },
  { key: 'team', label: 'Team Execution', desc: 'Founder credibility' },
  { key: 'risk', label: 'Security & Risk', desc: '10 = Lowest Risk' },
];

export const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
  if (!scores) {
    return null;
  }

  const values = Object.values(scores).filter((v) => typeof v === 'number');
  const avgScore = values.length > 0
    ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    : '0.0';

  const getScoreColor = (val: number) => {
    if (val >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 6) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getBarColor = (val: number) => {
    if (val >= 8) return 'bg-emerald-500';
    if (val >= 6) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div id="board-scorecard" className="bg-white rounded-xl border border-gray-200 p-3.5 mb-1">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <h3 className="font-bold text-[11px] tracking-wider uppercase text-gray-700">
            Investor Scorecard (1–10 Scale)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Consensus:</span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-bold ${
              Number(avgScore) >= 7.5
                ? 'bg-green-100 text-green-800'
                : Number(avgScore) >= 5.5
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {avgScore} / 10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {SCORE_LABELS.map(({ key, label, desc }) => {
          const val = scores[key] || 0;
          return (
            <div
              key={key}
              id={`score-item-${key}`}
              className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div
                  className={`text-base font-bold ${
                    val >= 7.5 ? 'text-gray-900' : val >= 5.5 ? 'text-yellow-600' : 'text-red-600'
                  }`}
                >
                  {val}
                </div>
                <div className="text-[9px] uppercase text-gray-400 font-semibold tracking-wider truncate" title={label}>
                  {label.split(' ')[0]}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    val >= 7.5 ? 'bg-indigo-600' : val >= 5.5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, val * 10))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
