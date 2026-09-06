import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PitchSession, ChatMessage } from '../types';

/**
 * Strict Undefined-Stripping Utility to prevent Firestore crash
 */
export function stripUndefined<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Save or update a pitch session document under users/{userId}/pitchSessions/{sessionId}
 */
export async function savePitchSession(
  userId: string,
  session: PitchSession
): Promise<void> {
  if (!userId) throw new Error('Cannot save session without an authenticated userId');

  const cleanSession = stripUndefined(session);
  const sessionRef = doc(db, 'users', userId, 'pitchSessions', session.id);

  try {
    await setDoc(sessionRef, cleanSession, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc failed, saving to localStorage backup:', err);
    try {
      const localKey = `bp_sessions_${userId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = existing.filter((s: PitchSession) => s.id !== session.id);
      filtered.unshift(cleanSession);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    } catch (_) {}
    throw err;
  }
}

/**
 * Save a message under users/{userId}/pitchSessions/{sessionId}/messages/{messageId}
 */
export async function saveSessionMessage(
  userId: string,
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  if (!userId || !sessionId) return;

  const cleanMessage = stripUndefined(message);
  const messageRef = doc(db, 'users', userId, 'pitchSessions', sessionId, 'messages', message.id);

  try {
    await setDoc(messageRef, cleanMessage, { merge: true });
  } catch (err) {
    console.warn('Firestore message save note:', err);
    try {
      const localKey = `bp_msgs_${userId}_${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.push(cleanMessage);
      localStorage.setItem(localKey, JSON.stringify(existing));
    } catch (_) {}
  }
}

/**
 * Load all pitch sessions for a specific user
 */
export async function loadUserSessions(userId: string): Promise<PitchSession[]> {
  if (!userId) return [];

  try {
    const sessionsCol = collection(db, 'users', userId, 'pitchSessions');
    const q = query(sessionsCol, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const sessions: PitchSession[] = [];
    snapshot.forEach((docSnap) => {
      sessions.push(docSnap.data() as PitchSession);
    });
    return sessions;
  } catch (err) {
    console.warn('Firestore loadUserSessions failed, checking localStorage fallback:', err);
    try {
      const localKey = `bp_sessions_${userId}`;
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch (_) {
      return [];
    }
  }
}

/**
 * Load chat messages for a session
 */
export async function loadSessionMessages(
  userId: string,
  sessionId: string
): Promise<ChatMessage[]> {
  if (!userId || !sessionId) return [];

  try {
    const msgsCol = collection(db, 'users', userId, 'pitchSessions', sessionId, 'messages');
    const q = query(msgsCol, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      messages.push(docSnap.data() as ChatMessage);
    });
    return messages;
  } catch (err) {
    console.warn('Firestore loadSessionMessages note, checking local fallback:', err);
    try {
      const localKey = `bp_msgs_${userId}_${sessionId}`;
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch (_) {
      return [];
    }
  }
}

/**
 * Delete a pitch session
 */
export async function deletePitchSession(
  userId: string,
  sessionId: string
): Promise<void> {
  if (!userId || !sessionId) return;
  try {
    const sessionRef = doc(db, 'users', userId, 'pitchSessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (err) {
    console.warn('Firestore delete session note:', err);
  }
  try {
    const localKey = `bp_sessions_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((s: PitchSession) => s.id !== sessionId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (_) {}
}
