
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

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
        return [];
    }
}
