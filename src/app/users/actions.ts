
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
        // Fetch all users from Firebase Auth
        const listUsersResult = await auth.listUsers(1000);
        const authUsers = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            displayName: userRecord.displayName || 'No Name',
            email: userRecord.email || 'No Email',
            photoURL: userRecord.photoURL,
        }));

        // Fetch all users from Firestore 'users' collection
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        const firestoreUsers = querySnapshot.docs.map(doc => doc.data() as UserProfile);

        // Create a map for quick lookup of Firestore users
        const firestoreUserMap = new Map<string, UserProfile>();
        firestoreUsers.forEach(user => firestoreUserMap.set(user.uid, user));

        // Merge Auth users with Firestore users, giving precedence to Firestore data
        // if there's a display name mismatch or other differences.
        const mergedUsers = authUsers.map(authUser => {
            const firestoreUser = firestoreUserMap.get(authUser.uid);
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

        // Correctly query for all users in a single batch
        const usersQuery = query(collection(db, 'users'), where('uid', 'in', allUserIds));
        const usersSnapshot = await getDocs(usersQuery);
        
        const fetchedUsers = usersSnapshot.docs.map(d => d.data() as UserProfile);

        return fetchedUsers;

    } catch (error) {
        console.error("Error fetching users for document:", error);
        return [];
    }
}
