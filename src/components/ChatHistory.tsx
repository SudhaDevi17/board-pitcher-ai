import React, { useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  DollarSign,
  ShieldAlert,
  HelpCircle,
  Compass,
  CornerDownLeft,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Scale,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, JudgeEvaluation } from '../types';
import { DecisionBanner } from './DecisionBanner';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isEvaluating: boolean;
  inputText: string;
  setInputText: (val: string) => void;
  onSendMessage: (customText?: string, requestDecision?: boolean) => void;
  onCallForVote: () => void;
  currentEvaluation?: JudgeEvaluation | null;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  isEvaluating,
  inputText,
  setInputText,
  onSendMessage,
  onCallForVote,
  currentEvaluation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isEvaluating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isEvaluating) {
        onSendMessage();
      }
    }
  };

  const getJudgeIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('ada')) return Sparkles;
    if (lower.includes('marcus')) return DollarSign;
    if (lower.includes('priya')) return ShieldAlert;
    return Sparkles;
  };

  const getJudgeColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('ada')) return { bg: 'bg-indigo-600', text: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (lower.includes('marcus')) return { bg: 'bg-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (lower.includes('priya')) return { bg: 'bg-rose-600', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
    return { bg: 'bg-slate-800', text: 'text-slate-800', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F3F4F6]">
      {/* Scrollable Chat Area */}
      <div id="chat-messages-container" className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center mb-3 text-indigo-600">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">
              The Investor Board is in Session
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Enter your startup pitch in the sidebar and click &ldquo;Pitch to the Board&rdquo;.
              Ada, Marcus, and Priya will interrogate your product clarity, unit economics, and risk vectors.
            </p>
            <div className="grid grid-cols-3 gap-2.5 w-full text-left">
              <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs">
                <span className="font-bold text-green-700 block mb-0.5 text-[11px] uppercase">Ada</span>
                <span className="text-[10px] text-gray-500 leading-tight block">Product clarity & defensibility</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs">
                <span className="font-bold text-blue-700 block mb-0.5 text-[11px] uppercase">Marcus</span>
                <span className="text-[10px] text-gray-500 leading-tight block">CAC, LTV & market traction</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs">
                <span className="font-bold text-purple-700 block mb-0.5 text-[11px] uppercase">Priya</span>
                <span className="text-[10px] text-gray-500 leading-tight block">Security & enterprise risk</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              return (
                <div key={msg.id} id={`msg-${msg.id}`} className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    YOU
                  </div>
                  <div className="bg-indigo-600 text-white p-3.5 rounded-xl rounded-tr-none text-sm shadow-xs leading-relaxed">
                    <span className="text-[10px] font-bold text-indigo-200 block mb-1 uppercase tracking-wider">
                      Founder Response
                    </span>
                    <p className="text-xs leading-relaxed whitespace-pre-line text-white font-sans">
                      {msg.content}
                    </p>
                    <span className="text-[9px] text-indigo-200 block text-right mt-1.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            }

            // Judges response
            const evalData = msg.evaluation;

            return (
              <div key={msg.id} id={`msg-${msg.id}`} className="space-y-4 max-w-4xl mx-auto w-full">
                {/* Decision Banner if present */}
                {evalData && <DecisionBanner evaluation={evalData} />}

                {/* 3 Judges Individual Critique Cards */}
                {evalData?.judges && (
                  <div className="space-y-3">
                    {(['ada', 'marcus', 'priya'] as const).map((key) => {
                      const judge = evalData.judges[key];
                      if (!judge) return null;

                      const avatarConfig = {
                        ada: { bg: 'bg-green-100 text-green-700', letter: 'A', role: 'Product' },
                        marcus: { bg: 'bg-blue-100 text-blue-700', letter: 'M', role: 'Business' },
                        priya: { bg: 'bg-purple-100 text-purple-700', letter: 'P', role: 'Risk' },
                      }[key];

                      return (
                        <div key={key} id={`judge-critique-${key}`} className="flex gap-3 max-w-[85%]">
                          <div className={`w-7 h-7 rounded-full ${avatarConfig.bg} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                            {avatarConfig.letter}
                          </div>
                          <div className="bg-white p-3.5 rounded-xl rounded-tl-none border border-gray-200 text-sm shadow-xs flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {judge.name} • {avatarConfig.role}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                judge.verdict === 'bullish'
                                  ? 'bg-green-100 text-green-700'
                                  : judge.verdict === 'skeptical'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {judge.verdict}
                              </span>
                            </div>

                            {judge.quote && (
                              <p className="text-xs text-gray-600 italic mb-1.5">
                                &lsquo;{judge.quote}&rsquo;
                              </p>
                            )}

                            <p className="text-xs text-gray-700 leading-relaxed">
                              {judge.feedback}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Investor Follow-Up Questions */}
                {evalData?.questions && evalData.questions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Investor Board Questions (Founder Defense)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {evalData.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-start gap-2 text-xs text-gray-800">
                            <span className="font-bold text-indigo-600 shrink-0">Q{idx + 1}:</span>
                            <span className="leading-relaxed">{q}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setInputText(`Regarding question ${idx + 1} ("${q}"): `);
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold shrink-0 cursor-pointer transition-colors"
                          >
                            Answer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Best Move Directive */}
                {evalData?.nextBestMove && (
                  <div className="bg-gray-900 text-white rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        Next Best Move
                      </h4>
                      <p className="text-xs text-gray-200 mt-1 leading-relaxed font-sans">
                        {evalData.nextBestMove}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Evaluating Thinking Indicator */}
        {isEvaluating && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs max-w-md mx-auto animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Ada, Marcus, and Priya are deliberating...
              </p>
              <p className="text-[10px] text-gray-400">
                Auditing product defensibility, TAM economics, and enterprise risks.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input & Action Bar */}
      <footer className="p-4 bg-white border-t border-gray-200 shrink-0">
        {/* Quick Action Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <button
            type="button"
            id="quick-defend-economics"
            onClick={() => setInputText("Here is our unit economics breakdown: Customer Acquisition Cost (CAC) is $85, Lifetime Value (LTV) is $1,450 with 14-month payback and 82% gross margins.")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium cursor-pointer transition-colors"
          >
            Clarify Unit Economics
          </button>
          <button
            type="button"
            id="quick-defend-security"
            onClick={() => setInputText("Regarding enterprise readiness: We are SOC2 Type II compliant, data is encrypted at rest and in transit via TLS 1.3, and we do not store customer credentials.")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium cursor-pointer transition-colors"
          >
            Address Security & Risk
          </button>
          <button
            type="button"
            id="quick-defend-moat"
            onClick={() => setInputText("Our core defensibility is our proprietary data flywheel and network effects: each customer transaction trains our risk model, increasing prediction accuracy.")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium cursor-pointer transition-colors"
          >
            Show Defensibility
          </button>
          <button
            type="button"
            id="quick-call-vote"
            onClick={onCallForVote}
            className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold cursor-pointer transition-colors flex items-center gap-1 ml-auto"
          >
            <Scale className="w-3 h-3" />
            Call for Final Vote
          </button>
        </div>

        {/* Main Input Field */}
        <div className="relative flex items-center">
          <textarea
            id="founder-chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Respond to Ada, Marcus, and Priya... (Press Enter to send)"
            rows={1}
            className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-gray-800 resize-none"
          />
          <button
            type="button"
            id="send-message-btn"
            disabled={isEvaluating || !inputText.trim()}
            onClick={() => onSendMessage()}
            className={`absolute right-2 px-4 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
              isEvaluating || !inputText.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};
