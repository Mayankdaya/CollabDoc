
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
        // Initialize without credentials in environments where the key isn't available
        // This might be the case in client-side rendering or certain test environments
        admin.initializeApp();
    }
}


export const auth = admin.auth();
export const db = admin.firestore();
