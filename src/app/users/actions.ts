
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { auth } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    try {
        const listUsersResult = await auth.listUsers(1000); // Fetches up to 1000 users
        const authUsers: UserProfile[] = listUsersResult.users.map((userRecord: UserRecord) => ({
            uid: userRecord.uid,
            displayName: userRecord.displayName || null,
            email: userRecord.email || null,
            photoURL: userRecord.photoURL || null,
        }));

        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        const firestoreUsers = new Map<string, UserProfile>();
        querySnapshot.forEach(doc => {
            const data = doc.data() as UserProfile;
            if (data.uid) {
                firestoreUsers.set(data.uid, data);
            }
        });

        // Merge auth users with firestore data, giving preference to firestore details if they exist
        const mergedUsers = authUsers.map(authUser => {
            const firestoreUser = firestoreUsers.get(authUser.uid);
            if (firestoreUser) {
                return { ...authUser, ...firestoreUser };
            }
            return authUser;
        });

        return mergedUsers;

    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
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

        const usersQuery = query(collection(db, 'users'), where('uid', 'in', allUserIds));
        const usersSnapshot = await getDocs(usersQuery);
        
        const fetchedUsers = usersSnapshot.docs.map(d => d.data() as UserProfile);

        return fetchedUsers;

    } catch (error) {
        console.error("Error fetching users for document:", error);
        return [];
    }
}
