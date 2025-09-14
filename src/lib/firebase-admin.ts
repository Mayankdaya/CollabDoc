
'use server';

import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // In a managed environment like Google App Engine or Cloud Functions (and App Hosting),
    // the SDK can auto-discover credentials.
    // For local development, you would set the GOOGLE_APPLICATION_CREDENTIALS env var.
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase Admin SDK initialization failed:', e);
  }
}

export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
// The admin db is not used. Client-side SDK with security rules is used for DB operations.
// export const db = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
