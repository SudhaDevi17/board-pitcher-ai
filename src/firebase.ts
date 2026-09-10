import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

// Resolve API key dynamically from GCP Cloud Run environment injection, Vite build env, or json fallback
const dynamicApiKey = typeof window !== 'undefined' ? (window as any).__FIREBASE_API_KEY__ : undefined;
const resolvedApiKey = dynamicApiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey;

const firebaseConfig = {
  apiKey: resolvedApiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use provisioned firestore database ID or default
let dbInstance: Firestore;
try {
  if (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') {
    dbInstance = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn('Initializing default firestore fallback:', e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    // If popup is blocked by iframe or browser, offer anonymous/guest sign-in
    throw error;
  }
}

/**
 * Local Guest User representation for sandbox / iframe environments
 * where Anonymous Auth is not enabled in Firebase Console.
 */
export interface LocalGuestUser {
  uid: string;
  email: null;
  displayName: string;
  photoURL: null;
  isAnonymous: true;
  getIdToken: () => Promise<string>;
}

export function getLocalGuestUser(): LocalGuestUser {
  let guestId = '';
  try {
    guestId = localStorage.getItem('bp_local_guest_uid') || '';
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('bp_local_guest_uid', guestId);
    }
  } catch (_) {
    guestId = 'guest_preview_user';
  }

  return {
    uid: guestId,
    email: null,
    displayName: 'Guest Founder',
    photoURL: null,
    isAnonymous: true,
    getIdToken: async () => `guest_token_${guestId}`,
  };
}

/**
 * Guest/Anonymous Sign-in for seamless preview in restrictive iframes.
 * Gracefully falls back to local isolated guest session if Anonymous
 * Auth is disabled (auth/admin-restricted-operation).
 */
export async function signInAsGuest(): Promise<User | LocalGuestUser> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMsg = error?.message || '';

    // Handle when Anonymous Provider is disabled in Firebase Console
    if (
      errorCode === 'auth/admin-restricted-operation' ||
      errorCode === 'auth/operation-not-allowed' ||
      errorMsg.includes('admin-restricted-operation')
    ) {
      console.info('Firebase Anonymous Auth is not enabled in Firebase Console. Providing isolated local guest session.');
      return getLocalGuestUser();
    }

    console.warn('Guest Sign-In note, falling back to local guest:', error);
    return getLocalGuestUser();
  }
}

/**
 * Sign out
 */
export async function signOutUser() {
  try {
    localStorage.removeItem('bp_local_guest_uid');
  } catch (_) {}
  return fbSignOut(auth);
}

/**
 * Get current Firebase ID token for API calls
 */
export async function getIdTokenSafe(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    try {
      const guestId = localStorage.getItem('bp_local_guest_uid');
      return guestId ? `guest_token_${guestId}` : null;
    } catch (_) {
      return null;
    }
  }
  try {
    return await currentUser.getIdToken(true);
  } catch (e) {
    console.warn('Could not fetch refreshed ID token:', e);
    return null;
  }
}

export { onAuthStateChanged, type User };
