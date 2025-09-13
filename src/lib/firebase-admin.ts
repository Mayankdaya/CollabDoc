
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // In a server environment, we must have credentials to initialize the Admin SDK.
        // If they are not available, we should not proceed.
        if (process.env.NODE_ENV !== 'development') {
          console.error('Firebase Admin SDK initialization failed: FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
        } else {
          // For local development, we can initialize without credentials for some features, but auth will fail.
          // This prevents a hard crash during local dev if keys are not set.
          // Note: This path will not work for server-side auth checks.
        }
    }
}


export const auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
export const db = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
