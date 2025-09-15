
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, getDoc, where } from "firebase/firestore";
import { auth as adminAuth } from "@/lib/firebase-admin";

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const userProfiles: UserProfile[] = [];
    try {
        const listUsersResult = await adminAuth.listUsers();
        
        const firestoreUsersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(firestoreUsersQuery);
        const firestoreUsers = new Map(querySnapshot.docs.map(doc => [doc.id, doc.data()]));

        listUsersResult.users.forEach(userRecord => {
            const firestoreData = firestoreUsers.get(userRecord.uid);
            userProfiles.push({
                uid: userRecord.uid,
                email: userRecord.email || null,
                displayName: firestoreData?.displayName || userRecord.displayName || 'Unnamed User',
                photoURL: firestoreData?.photoURL || userRecord.photoURL || null,
            });
        });
        
        return userProfiles;
    } catch (error) {
        console.error("Error fetching all users:", error);
        // Fallback to only firestore if admin fails (e.g. local dev without creds)
        try {
            const usersQuery = query(collection(db, 'users'));
            const querySnapshot = await getDocs(usersQuery);
            querySnapshot.forEach(doc => {
                const data = doc.data();
                userProfiles.push({
                    uid: data.uid,
                    displayName: data.displayName || null,
                    email: data.email || null,
                    photoURL: data.photoURL || null,
                });
            });
            return userProfiles;
        } catch (dbError) {
             console.error("Error fetching all users from Firestore as fallback:", dbError);
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
        
        const userChunks: string[][] = [];
        for (let i = 0; i < allUserIds.length; i += 30) {
            userChunks.push(allUserIds.slice(i, i + 30));
        }

        const userPromises = userChunks.map(chunk => 
            getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)))
        );

        const userSnapshots = await Promise.all(userPromises);
        
        const fetchedUsers = userSnapshots.flatMap(snapshot => 
            snapshot.docs.map(d => d.data() as UserProfile)
        );

        return fetchedUsers;

    } catch (error) {
        console.error("Error fetching users for document:", error);
        return [];
    }
}
