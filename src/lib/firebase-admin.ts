
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
        }
    }
}


export const auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
export const db = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
