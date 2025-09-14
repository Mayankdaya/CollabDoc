
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, getDoc, where } from "firebase/firestore";
import { auth } from "@/lib/firebase-admin";

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    try {
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        // As a fallback, try listing users from Firebase Auth if Firestore fails
        try {
            const listUsersResult = await auth.listUsers(1000);
            return listUsersResult.users.map(userRecord => ({
                uid: userRecord.uid,
                displayName: userRecord.displayName || 'No Name',
                email: userRecord.email || 'No Email',
                photoURL: userRecord.photoURL,
            }));
        } catch (authError) {
             console.error("Error fetching users from Auth:", authError);
             return [];
        }
    }
}

export async function getUsersForDocument(documentId: string): Promise<UserProfile[]> {
    if (!documentId) return [];

    try {
        const docRef = doc(db, 'documents', documentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error("Document not found:", documentId);
            return [];
        }

        const docData = docSnap.data();
        const ownerId = docData.userId;
        const collaboratorIds: string[] = docData.collaborators || [];
        const allUserIds = [...new Set([ownerId, ...collaboratorIds].filter(Boolean))];

        if (allUserIds.length === 0) {
            return [];
        }

        // Firestore 'in' query is limited. Fetching users one by one is more robust for smaller lists
        // and avoids the 30-item limit for larger lists if we were to scale.
        const userPromises = allUserIds.map(uid => getDoc(doc(db, 'users', uid)));
        const userDocs = await Promise.all(userPromises);

        const fetchedUsers = userDocs
            .filter(d => d.exists())
            .map(d => d.data() as UserProfile);

        return fetchedUsers;

    } catch (error) {
        console.error("Error fetching users for document:", error);
        return [];
    }
}
