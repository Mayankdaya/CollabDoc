
"use client";

import React, { useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Phone, Video } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { FoundUser } from './share-dialog';

interface TeamPanelProps {
  peopleWithAccess: FoundUser[];
  onlineUserUIDs: string[];
  onStartCall: (user: FoundUser, type: 'voice' | 'video') => void;
}

export default function TeamPanel({ peopleWithAccess, onlineUserUIDs, onStartCall }: TeamPanelProps) {
  const { user: currentUser } = useAuth();
  
  const isUserOnline = useCallback((personUid: string) => {
    return onlineUserUIDs.includes(personUid);
  }, [onlineUserUIDs]);

  const getOwnerId = () => {
      // This is a simplification. In a real app, the owner might be stored on the doc.
      if (peopleWithAccess.length > 0) {
        return peopleWithAccess[0].uid;
      }
      return currentUser?.uid;
  }
  
  const ownerId = getOwnerId();

  return (
    <div className="flex h-full flex-col">
       <div className='p-4 border-b border-white/30'>
          <h2 className="font-headline text-lg font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground">Users with access to this document.</p>
       </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {peopleWithAccess.length > 0 ? (
          peopleWithAccess.map(person => (
            <UserRow
              key={person.uid}
              person={person}
              isOnline={isUserOnline(person.uid)}
              isCurrentUser={person.uid === currentUser?.uid}
              role={person.uid === ownerId ? 'Owner' : 'Editor'} 
              onStartCall={onStartCall}
            />
          ))
        ) : (
            <p className="text-center text-muted-foreground p-4">Only you have access to this document.</p>
        )}
      </div>
    </div>
  );
}


interface UserRowProps {
    person: FoundUser;
    isOnline: boolean;
    isCurrentUser: boolean;
    role: string;
    onStartCall: (user: FoundUser, type: 'voice' | 'video') => void;
}

function UserRow({ person, isOnline, isCurrentUser, role, onStartCall }: UserRowProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    {person.photoURL && <AvatarImage src={person.photoURL} alt={person.displayName} />}
                    <AvatarFallback>{person.displayName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{person.displayName} {isCurrentUser && '(You)'}</p>
                    <div className='flex items-center gap-2'>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                    {isOnline && (
                        <div className="flex items-center gap-1.5" title="Online">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                            <span className="text-xs text-muted-foreground">online</span>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-1'>
                 {isOnline && !isCurrentUser && (
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall(person, 'voice')}>
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onStartCall(person, 'video')}>
                            <Video className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <span className="text-sm text-muted-foreground ml-2">
                    {role}
                </span>
            </div>
        </div>
    )
}
