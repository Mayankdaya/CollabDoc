
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, query, where, arrayUnion } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from '@/lib/firebase';
import { headers } from "next/headers";

export interface Document {
    id: string;
    name: string;
    content: string;
    lastModified: string;
    lastModifiedBy: string;
    userId: string; // Owner of the document
    collaborators: string[]; // Array of user UIDs
}

export async function getDocuments(userId: string) {
    if (!userId) {
        return [];
    }
    // Query for documents where the user is either the owner or a collaborator
    const ownedDocsQuery = query(collection(db, "documents"), where("userId", "==", userId));
    const sharedDocsQuery = query(collection(db, "documents"), where("collaborators", "array-contains", userId));
    
    const [ownedDocsSnapshot, sharedDocsSnapshot] = await Promise.all([
        getDocs(ownedDocsQuery),
        getDocs(sharedDocsQuery)
    ]);

    const documentMap = new Map<string, Document>();

    const processSnapshot = (snapshot: any) => {
        snapshot.docs.forEach((doc: any) => {
            if (!documentMap.has(doc.id)) {
                const data = doc.data();
                const lastModifiedDate = data.lastModified?.toDate() || new Date();
                documentMap.set(doc.id, {
                    id: doc.id,
                    name: data.name,
                    content: data.content,
                    lastModified: lastModifiedDate.toISOString(),
                    lastModifiedBy: data.lastModifiedBy || 'Unknown',
                    userId: data.userId,
                    collaborators: data.collaborators || [],
                } as Document);
            }
        });
    };
    
    processSnapshot(ownedDocsSnapshot);
    processSnapshot(sharedDocsSnapshot);
    
    const documentList = Array.from(documentMap.values());

    // Sort on the server-side after fetching
    return documentList.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
}

export async function getDocument(id: string) {
    const headersList = headers();
    const user = auth.currentUser; // This might be null on server

    const docRef = doc(db, "documents", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        const lastModifiedDate = data.lastModified?.toDate() || new Date();
        
        const serializableData = {
            id: docSnap.id,
            name: data.name,
            content: data.content,
            lastModified: lastModifiedDate.toISOString(),
            lastModifiedBy: data.lastModifiedBy || 'Unknown',
            userId: data.userId,
            collaborators: data.collaborators || [],
        };
        
        return JSON.parse(JSON.stringify(serializableData)) as Document;

    } else {
        return null;
    }
}

export async function createDocument({ name, userId, userName }: { name: string, userId: string, userName: string }) {
    if (!userId) {
        throw new Error("You must be logged in to create a document.");
    }
    if (!name || name.trim().length === 0) {
        name = "Untitled Document";
    }
    const docRef = await addDoc(collection(db, "documents"), {
        name: name,
        content: "",
        userId: userId,
        lastModified: serverTimestamp(),
        lastModifiedBy: userName,
        collaborators: [], // Initialize with no collaborators
    });
    revalidatePath("/dashboard");
    redirect(`/documents/${docRef.id}`);
}


export async function updateDocument(id: string, data: { name?: string; content?: string; collaborators?: any }, user: { uid: string, displayName: string | null}) {
    if (!user) {
        throw new Error("You must be logged in to update a document.");
    }
    const docRef = doc(db, "documents", id);
    
    let updateData: any = {
        lastModified: serverTimestamp(),
        lastModifiedBy: user.displayName || 'Anonymous'
    };

    if (data.name) updateData.name = data.name;
    if (data.content) updateData.content = data.content;
    if (data.collaborators) updateData.collaborators = data.collaborators;
    

    await updateDoc(docRef, updateData);
    
    revalidatePath(`/documents/${id}`);
    revalidatePath("/dashboard");

    const updatedDoc = await getDoc(docRef);
    const updatedData = updatedDoc.data();
    const lastModifiedDate = updatedData?.lastModified?.toDate() || new Date();


    return { 
        success: true, 
        lastModified: lastModifiedDate.toISOString(),
        lastModifiedBy: updatedData?.lastModifiedBy || 'Anonymous',
    };
}


export async function saveDocumentAs({ name, content, userId, userName }: { name: string, content: string, userId: string, userName: string }) {
     if (!userId) {
        throw new Error("You must be logged in to save a document.");
    }
    const docRef = await addDoc(collection(db, "documents"), {
        name: `${name} (Copy)`,
        content: content,
        userId: userId,
        lastModified: serverTimestamp(),
        lastModifiedBy: userName,
        collaborators: [],
    });
    revalidatePath("/dashboard");
    redirect(`/documents/${docRef.id}`);
}

export async function deleteDocument({id, userId}: {id: string, userId: string}) {
    if (!userId) {
        throw new Error("You must be logged in to delete a document.");
    }

    const docRef = doc(db, "documents", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().userId === userId) {
        await deleteDoc(docRef);
        revalidatePath("/dashboard");
    } else {
        throw new Error("You do not have permission to delete this document or it does not exist.");
    }
}
