
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Document } from '@/app/documents/actions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import type { Awareness } from 'y-protocols/awareness';
import { Button } from '../ui/button';
import { Phone, Video } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { FoundUser } from './share-dialog';

interface TeamPanelProps {
  doc: Document;
  awareness: Awareness | null;
  onStartCall: (user: FoundUser, type: 'voice' | 'video') => void;
  peopleWithAccess: FoundUser[];
}

export default function TeamPanel({ doc, awareness, onStartCall, peopleWithAccess }: TeamPanelProps) {
  const { user: currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (awareness) {
        const updateOnlineUsers = () => {
            const states = Array.from(awareness.getStates().values());
            const users = states
                .map((state) => state.user)
                .filter((user): user is { name: string; color: string; uid: string } => user !== null && !!user.uid);
            
            const uniqueUsers = Array.from(new Map(users.map(u => [u.uid, u])).values());
            setOnlineUsers(uniqueUsers);
        };
        awareness.on('change', updateOnlineUsers);
        updateOnlineUsers(); // Initial call
        return () => awareness.off('change', updateOnlineUsers);
    }
  }, [awareness]);

  useEffect(() => {
    setIsLoading(peopleWithAccess.length === 0);
  }, [peopleWithAccess]);
  

  const isUserOnline = useCallback((user: FoundUser) => {
    return onlineUsers.some(onlineUser => onlineUser.uid === user.uid);
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
                                    <div className="flex items-center gap-1.5" title="Online">
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                                        <span className="text-xs text-muted-foreground">online</span>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                             {isUserOnline(person) && person.uid !== currentUser?.uid && (
                                <>
                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall(person, 'voice')}>
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall(person, 'video')}>
                                    <Video className="h-4 w-4" />
                                </Button>
                                </>
                            )}
                            <span className="text-sm text-muted-foreground">
                                {person.uid === doc.userId ? 'Owner' : 'Editor'}
                            </span>
                        </div>
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
