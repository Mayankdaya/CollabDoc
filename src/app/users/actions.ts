
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
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
