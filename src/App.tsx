import React, { useState, useEffect, useCallback } from 'react';
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  signOutUser,
  onAuthStateChanged,
  getLocalGuestUser,
  LocalGuestUser,
  User,
} from './firebase';
import {
  savePitchSession,
  saveSessionMessage,
  loadUserSessions,
  loadSessionMessages,
  deletePitchSession,
} from './services/firestore';
import { evaluatePitchApi } from './services/api';
import {
  JudgeMode,
  JudgeEvaluation,
  PitchSession,
  ChatMessage,
  AppUser,
} from './types';
import { PitchSidebar } from './components/PitchSidebar';
import { JudgeCards } from './components/JudgeCards';
import { Scoreboard } from './components/Scoreboard';
import { ChatHistory } from './components/ChatHistory';
import { WalkthroughModal } from './components/WalkthroughModal';
import { RequireAuthModal } from './components/RequireAuthModal';
import { SAMPLE_PITCHES, SamplePitchData } from './data/samplePitches';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | LocalGuestUser | AppUser | null>(null);
  const [pitch, setPitch] = useState<string>('');
  const [mode, setMode] = useState<JudgeMode>('decision');
  const [sessions, setSessions] = useState<PitchSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authActionAttempted, setAuthActionAttempted] = useState<string>('evaluate custom startup pitches');

  // Check if current user is a guest (unauthenticated or local guest)
  const isGuest = !user || (user as any).isAnonymous || !(user as any).email;

  // Derive latest evaluation from the most recent judge message
  const latestEvaluation: JudgeEvaluation | null =
    [...messages]
      .reverse()
      .find((m) => m.role === 'judges' && m.evaluation)?.evaluation || null;

  // Initial preload of demo pitch so guests see an instant active board deliberation
  useEffect(() => {
    if (messages.length === 0 && !currentSessionId) {
      const defaultSample = SAMPLE_PITCHES[0];
      setPitch(defaultSample.pitch);
      setMessages([defaultSample.initialMessage, defaultSample.judgeResponse]);
      setCurrentSessionId(defaultSample.id);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userSessions = await loadUserSessions(currentUser.uid);
          setSessions(userSessions);
        } catch (e) {
          console.warn('Could not load user sessions:', e);
        }
      } else {
        // Safe guest fallback for immediate interaction without throwing auth/admin-restricted-operation
        const localGuest = getLocalGuestUser();
        setUser(localGuest);
        try {
          const userSessions = await loadUserSessions(localGuest.uid);
          setSessions(userSessions);
        } catch (e) {
          console.warn('Could not load local guest sessions:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Show auto-dismiss notification toast
  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        showToast(`Welcome, ${signedInUser.displayName || 'Founder'}!`);
        const userSessions = await loadUserSessions(signedInUser.uid);
        setSessions(userSessions);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrorMessage(err.message || 'Google Sign-In was blocked or cancelled.');
    }
  };

  // Handle Guest Sign-In
  const handleGuestSignIn = async () => {
    try {
      setErrorMessage(null);
      const guest = await signInAsGuest();
      setUser(guest as any);
      showToast('Signed in as Guest Founder (Local Session)');
      const userSessions = await loadUserSessions(guest.uid);
      setSessions(userSessions);
    } catch (err: any) {
      console.warn('Guest sign-in note:', err);
      const localGuest = getLocalGuestUser();
      setUser(localGuest);
      showToast('Continuing as Guest Founder');
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      const localGuest = getLocalGuestUser();
      setUser(localGuest);
      setSessions([]);
      setMessages([]);
      setCurrentSessionId(null);
      setPitch('');
      showToast('Signed out. Switched to Guest session.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Create or Reset Session
  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setPitch('');
    setErrorMessage(null);
  };

  // Select Saved Session
  const handleSelectSession = async (sessionId: string) => {
    if (!user) return;
    try {
      setErrorMessage(null);
      setCurrentSessionId(sessionId);
      const selected = sessions.find((s) => s.id === sessionId);
      if (selected) {
        setPitch(selected.pitch || '');
        setMode(selected.mode || 'decision');
      }
      const loadedMsgs = await loadSessionMessages(user.uid, sessionId);
      setMessages(loadedMsgs);
    } catch (err: any) {
      setErrorMessage('Failed to load session: ' + err.message);
    }
  };

  // Delete Saved Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deletePitchSession(user.uid, sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewSession();
      }
      showToast('Session deleted.');
    } catch (err: any) {
      setErrorMessage('Could not delete session: ' + err.message);
    }
  };

  // Select Interactive Sample Pitch (Zero AI Quota)
  const handleSelectSamplePitch = (sample: SamplePitchData) => {
    setCurrentSessionId(sample.id);
    setPitch(sample.pitch);
    setMode('decision');
    setMessages([sample.initialMessage, sample.judgeResponse]);
    setErrorMessage(null);
    showToast(`Loaded interactive demo: ${sample.title} (${sample.decision})`);
  };

  // Evaluate Pitch (First turn or revised pitch)
  const handleStartEvaluation = async () => {
    if (!pitch.trim() || isEvaluating) return;

    // Strategy 3: Require Google Sign-In for custom pitches
    if (isGuest) {
      setAuthActionAttempted('evaluate your custom startup pitch with live Gemini AI');
      setIsAuthModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setIsEvaluating(true);

    const effectiveUser = user || auth.currentUser;
    const userId = effectiveUser?.uid || 'guest_temp_uid';
    const sessionId = currentSessionId || `session_${Date.now()}`;
    setCurrentSessionId(sessionId);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_founder`,
      role: 'user',
      content: pitch.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessagesList = [userMessage];
    setMessages(newMessagesList);

    try {
      // Call Gemini Server Endpoint
      const response = await evaluatePitchApi({
        pitch: pitch.trim(),
        mode,
        userMessage: 'Founder presents initial pitch to the board.',
        messagesHistory: [],
        requestedDecision: false,
      });

      if (!response.success || !response.evaluation) {
        throw new Error(response.error || 'Evaluation failed to return valid judge data.');
      }

      const evaluation = response.evaluation;

      const judgeMessage: ChatMessage = {
        id: `msg_${Date.now()}_judges`,
        role: 'judges',
        content: evaluation.decisionReason || 'Board deliberation complete.',
        evaluation,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessagesList, judgeMessage];
      setMessages(updatedMessages);

      // Persist to Firestore
      const sessionObj: PitchSession = {
        id: sessionId,
        userId,
        title: pitch.slice(0, 45).replace(/[\n\r]+/g, ' ') + '...',
        pitch: pitch.trim(),
        mode,
        decision: evaluation.decision,
        latestScores: evaluation.scores,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messagesCount: updatedMessages.length,
      };

      await savePitchSession(userId, sessionObj);
      await saveSessionMessage(userId, sessionId, userMessage);
      await saveSessionMessage(userId, sessionId, judgeMessage);

      // Update local sessions state
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        return [sessionObj, ...filtered];
      });

      showToast(`Board completed evaluation. Verdict: ${evaluation.decision}`);
    } catch (err: any) {
      console.error('Pitch evaluation failed:', err);
      setErrorMessage(err.message || 'Deliberation encountered an issue. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Send Multi-Turn Follow-Up Message
  const handleSendMessage = async (customText?: string, requestDecision: boolean = false) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend && !requestDecision) return;
    if (isEvaluating) return;

    // Strategy 3: Require Google Sign-In for custom messages & follow-ups
    if (isGuest) {
      setAuthActionAttempted('send follow-up responses and defend your pitch to the board');
      setIsAuthModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setIsEvaluating(true);
    setInputText('');

    const effectiveUser = user || auth.currentUser;
    const userId = effectiveUser?.uid || 'guest_temp_uid';
    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) setCurrentSessionId(sessionId);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_founder`,
      role: 'user',
      content: textToSend || (requestDecision ? 'Founder calls for a final investment vote from the board.' : ''),
      timestamp: new Date().toISOString(),
    };

    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);

    try {
      const historyForApi = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await evaluatePitchApi({
        pitch: pitch.trim() || 'Refer to previous conversation',
        mode: requestDecision ? 'decision' : mode,
        userMessage: userMessage.content,
        messagesHistory: historyForApi,
        requestedDecision: requestDecision,
      });

      if (!response.success || !response.evaluation) {
        throw new Error(response.error || 'Judges failed to return a response.');
      }

      const evaluation = response.evaluation;

      const judgeMessage: ChatMessage = {
        id: `msg_${Date.now()}_judges`,
        role: 'judges',
        content: evaluation.decisionReason || 'Board response.',
        evaluation,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessagesWithUser, judgeMessage];
      setMessages(finalMessages);

      // Persist in Firestore
      const sessionObj: PitchSession = {
        id: sessionId,
        userId,
        title: pitch.slice(0, 45).replace(/[\n\r]+/g, ' ') || 'Pitch Session',
        pitch: pitch.trim(),
        mode,
        decision: evaluation.decision,
        latestScores: evaluation.scores,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messagesCount: finalMessages.length,
      };

      await savePitchSession(userId, sessionObj);
      await saveSessionMessage(userId, sessionId, userMessage);
      await saveSessionMessage(userId, sessionId, judgeMessage);

      // Update local sessions state
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        return [sessionObj, ...filtered];
      });

      if (evaluation.decision === 'ACCEPT') {
        showToast('🎉 Term Sheet Extended! Pitch Accepted by the Board.');
      } else if (evaluation.decision === 'REJECT') {
        showToast('❌ Board Passed. Review necessary improvements.');
      } else {
        showToast('Board critique updated.');
      }
    } catch (err: any) {
      console.error('Follow-up deliberation error:', err);
      setErrorMessage(err.message || 'Deliberation error. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Call for Final Investment Vote Shortcut
  const handleCallForVote = () => {
    if (isGuest) {
      setAuthActionAttempted('call for a final investment vote from the board');
      setIsAuthModalOpen(true);
      return;
    }
    handleSendMessage('We have addressed the critical points. I would now like to call for a final investment decision from the board.', true);
  };

  // Run Walkthrough Scenario Preset
  const handleRunScenario = (scenarioId: string) => {
    if (scenarioId === 'TC-01') {
      // Test Auth
      handleGuestSignIn();
    } else if (scenarioId === 'TC-02' || scenarioId === 'TC-03') {
      setPitch('CyberGuard AI is an automated incident response copilot for SOC teams that eliminates 85% of false-positive triage. We run agentic forensic workflows directly inside customer VPCs without extracting proprietary code or PII. We have 4 Fortune 500 pilots at $120k ACV, 3.2x YoY pipeline growth, seeking $2M Seed at $12M cap.');
      setMode('decision');
    } else if (scenarioId === 'TC-04') {
      setPitch('FleetPulse retrofits forklifts with LiDAR and cameras for autonomous operation. 3 warehouses live, $1500/forklift/mo SaaS subscription, 99.8% uptime.');
      setMode('decision');
    } else {
      setPitch('MediClaim uses grounded medical LLMs to resolve outpatient insurance claims with 42% reduced denial rate.');
    }
    showToast(`Loaded preset scenario for ${scenarioId}`);
  };

  return (
    <div id="board-pitcher-app" className="flex h-screen w-screen overflow-hidden bg-[#F3F4F6] font-sans text-[#111827]">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          id="app-notification-toast"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white text-gray-900 px-4 py-2.5 rounded-xl shadow-md border border-gray-200 text-xs font-medium animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          id="app-error-banner"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium max-w-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-white hover:text-rose-200 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Left Panel: Pitch Context, Sidebar, History & Controls */}
      <PitchSidebar
        user={user}
        pitch={pitch}
        setPitch={setPitch}
        mode={mode}
        setMode={setMode}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onSelectSamplePitch={handleSelectSamplePitch}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignInGuest={handleGuestSignIn}
        onSignOut={handleSignOut}
        isEvaluating={isEvaluating}
        onStartEvaluation={handleStartEvaluation}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
      />

      {/* Main Panel: Dashboard, Judge Cards, Scoreboard & Chat History */}
      <main id="main-pitch-dashboard" className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
        {/* Top Header: 3 Judges Bar & Scoreboard */}
        <header className="p-4 md:p-6 border-b border-gray-200 bg-white shrink-0">
          <JudgeCards evaluation={latestEvaluation} />
          <div className="mt-4">
            <Scoreboard scores={latestEvaluation?.scores} />
          </div>
        </header>

        {/* Multi-Turn Conversation & Input Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatHistory
            messages={messages}
            isEvaluating={isEvaluating}
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
            onCallForVote={handleCallForVote}
            currentEvaluation={latestEvaluation}
          />
        </div>
      </main>

      {/* Verification & Walkthrough Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onRunScenario={handleRunScenario}
      />

      {/* Strategy 3: Require Auth Modal */}
      <RequireAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignInWithGoogle={handleGoogleSignIn}
        actionAttempted={authActionAttempted}
      />
    </div>
  );
}
