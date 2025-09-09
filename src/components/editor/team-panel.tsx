
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { onSnapshot, doc as firestoreDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Document } from '@/app/documents/actions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { getAllUsers } from '@/app/users/actions';
import { Separator } from '../ui/separator';

interface TeamPanelProps {
  doc: Document;
  onlineUsers: any[];
}

type UserProfile = {
    uid: string;
    displayName: string;
    email: string;
}

const fetchUserProfiles = async (uids: string[]): Promise<UserProfile[]> => {
    if (uids.length === 0) return [];
    try {
        const usersRef = collection(db, 'users');
        // Firestore 'in' query is limited to 30 items. We may need to batch this for >30 collaborators
        const q = query(usersRef, where('uid', 'in', uids));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) {
        console.error("Error fetching user profiles:", e);
        return [];
    }
};

export default function TeamPanel({ doc, onlineUsers }: TeamPanelProps) {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doc.id) return;

    setIsLoading(true);
    const docRef = firestoreDoc(db, 'documents', doc.id);

    const unsubscribe = onSnapshot(docRef, async (snap) => {
        const docData = snap.data();
        if (!docData) {
            setIsLoading(false);
            return;
        }

        const ownerId = docData.userId;
        const collaboratorIds = docData.collaborators || [];
        const allMemberIds = Array.from(new Set([ownerId, ...collaboratorIds])).filter(Boolean);

        const profiles = await fetchUserProfiles(allMemberIds);
        const profileMap = new Map(profiles.map(p => [p.uid, p]));

        setOwner(ownerId ? profileMap.get(ownerId) || null : null);
        setCollaborators(collaboratorIds.map((id: string) => profileMap.get(id)).filter(Boolean));
        
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [doc.id]);

  const peopleWithAccess = useMemo(() => {
    const allPeople = new Map<string, UserProfile>();
    if (owner) {
        allPeople.set(owner.uid, owner);
    }
    collaborators.forEach(c => {
        if (!allPeople.has(c.uid)) {
            allPeople.set(c.uid, c);
        }
    });
    return Array.from(allPeople.values());
  }, [owner, collaborators]);

  const isUserOnline = useCallback((user: UserProfile) => {
    // This is an approximation as we don't have a direct mapping from awareness clientId to user uid
    // It checks if any online user has the same display name.
    return onlineUsers.some(onlineUser => onlineUser.name === user.displayName);
  }, [onlineUsers]);


  return (
    <div className="flex h-full flex-col">
       <div className='p-4 border-b border-white/30'>
          <h2 className="font-headline text-lg font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground">Manage who has access to this document.</p>
       </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <>
                <p className="text-xs font-semibold text-muted-foreground uppercase">People with Access</p>
                {peopleWithAccess.map(person => (
                    <div key={person.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{person.displayName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{person.displayName}</p>
                                <div className='flex items-center gap-2'>
                                <p className="text-sm text-muted-foreground">{person.email}</p>
                                {isUserOnline(person) && (
                                    <span title="Online" className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                                )}
                                </div>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {person.uid === doc.userId ? 'Owner' : 'Editor'}
                        </span>
                    </div>
                ))}
            </>
        )}
        {!isLoading && peopleWithAccess.length === 0 && (
            <p className="text-center text-muted-foreground">No users have access to this document.</p>
        )}
      </div>
    </div>
  );
}
    
