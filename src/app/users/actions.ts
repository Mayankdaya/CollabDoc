
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, getDoc, where } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    try {
        // Query the 'users' collection directly from Firestore
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        
        const users: UserProfile[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                uid: data.uid,
                displayName: data.displayName || null,
                email: data.email || null,
                photoURL: data.photoURL || null,
            });
        });

        return users;

    } catch (error) {
        console.error("Error fetching all users from Firestore:", error);
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
