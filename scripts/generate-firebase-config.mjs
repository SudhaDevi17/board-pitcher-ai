// Generates firebase-applet-config.json from FIREBASE_* env vars.
// Runs as an npm "prebuild" hook. If the file already exists (e.g. a
// developer's local copy, or one restored from AI Studio's live workspace),
// it is left untouched so existing workflows keep working unchanged.
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const configPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'firebase-applet-config.json',
);

if (existsSync(configPath)) {
  process.exit(0);
}

try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {
  // dotenv not installed (e.g. node_modules absent); fall back to
  // whatever FIREBASE_* vars are already present in process.env.
}

const required = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
  apiKey: process.env.FIREBASE_API_KEY,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(
    `firebase-applet-config.json is missing and FIREBASE_* env vars are not set (missing: ${missing.join(', ')}).\n` +
      'Either copy firebase-applet-config.example.json to firebase-applet-config.json and fill in real values,\n' +
      'or set FIREBASE_PROJECT_ID / FIREBASE_APP_ID / FIREBASE_API_KEY (and optionally FIREBASE_AUTH_DOMAIN,\n' +
      'FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_FIRESTORE_DATABASE_ID, FIREBASE_MEASUREMENT_ID,\n' +
      'FIREBASE_OAUTH_CLIENT_ID, FIREBASE_RECAPTCHA_SITE_KEY) before building.',
  );
  process.exit(1);
}

const config = {
  projectId: required.projectId,
  appId: required.appId,
  apiKey: required.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${required.projectId}.firebaseapp.com`,
  firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${required.projectId}.firebasestorage.app`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
  oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || '',
  recaptchaSiteKey: process.env.FIREBASE_RECAPTCHA_SITE_KEY || '',
};

writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Generated firebase-applet-config.json from FIREBASE_* env vars.');
