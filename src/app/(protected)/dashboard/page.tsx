
import { getDocuments, Document } from "@/app/documents/actions";
import { DashboardClient } from './dashboard-client';
import { auth as adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

async function getAuthenticatedUser() {
    try {
        const sessionCookie = cookies().get("session")?.value;
        if (!sessionCookie) return null;
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return {
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            displayName: decodedClaims.name,
            photoURL: decodedClaims.picture,
        };
    } catch (error) {
        // Session cookie is invalid or expired.
        // In a real app, you'd handle this more gracefully, maybe by redirecting to login.
        console.warn("Could not verify session cookie:", error);
        return null;
    }
}


export default async function DashboardPage() {
    const user = await getAuthenticatedUser();
    
    if (!user) {
        redirect('/login');
    }

    const documents = await getDocuments(user.uid);

    const serializableUser = {
        uid: user.uid,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
    };

    return <DashboardClient initialDocuments={documents} user={serializableUser} />;
}
