
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface FoundUser {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
}

interface TeamPanelProps {
  peopleWithAccess: FoundUser[];
  onlineUsers: any[];
  ownerId: string;
}

export default function TeamPanel({ peopleWithAccess, onlineUsers, ownerId }: TeamPanelProps) {

  const onlineUserIds = new Set(onlineUsers.map(u => u.uid));

  return (
    <div className="flex h-full flex-col">
      <div className='p-4 border-b border-white/30'>
        <h2 className="font-headline text-lg font-semibold">Team</h2>
        <p className="text-sm text-muted-foreground">Users with access to this document.</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {peopleWithAccess.map((person) => {
            const isOnline = onlineUserIds.has(person.uid);
            const isOwner = person.uid === ownerId;

            return (
              <div key={person.uid} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {person.photoURL && <AvatarImage src={person.photoURL} alt={person.displayName} />}
                    <AvatarFallback>{person.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">{person.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {isOwner && <Badge variant="secondary">Owner</Badge>}
                    <Badge variant={isOnline ? 'outline' : 'secondary'} className={isOnline ? 'border-green-500 text-green-500' : ''}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                </div>
              </div>
            );
          })}
          {peopleWithAccess.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
                No one else has access to this document yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
