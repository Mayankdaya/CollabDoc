
"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface OnlineUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    state: 'online' | 'offline';
    last_changed: any;
}

export async function getOnlineUsers(): Promise<OnlineUser[]> {
    try {
        const statusCollection = collection(db, 'status');
        const q = query(statusCollection, where("state", "==", "online"));
        const querySnapshot = await getDocs(q);
        
        const onlineUsers: OnlineUser[] = [];
        querySnapshot.forEach(doc => {
            onlineUsers.push(doc.data() as OnlineUser);
        });

        return onlineUsers;
    } catch (error) {
        console.error("Error fetching online users:", error);
        return [];
    }
}
