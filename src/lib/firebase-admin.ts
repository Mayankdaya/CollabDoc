
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'latexresumeai',
        });
    } else {
        // For local development and in environments where the service account key is not set,
        // we can initialize without credentials for features that don't require admin privileges (like auth session cookies).
        // However, this will not work for server-side database access via the admin SDK.
        if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
             admin.initializeApp({
                projectId: 'latexresumeai',
            });
        } else {
            console.error('Firebase Admin SDK initialization failed: FIREBASE_SERVICE_ACCOUNT_KEY is not set in a production environment.');
        }
    }
}


export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
// The admin db is no longer used for document creation.
// export const db = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
