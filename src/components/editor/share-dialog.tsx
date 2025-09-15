
import { Copy, UserPlus, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { ReactNode, useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Document, updateDocument } from '@/app/documents/actions';
import { db } from '@/lib/firebase';
import { onSnapshot, doc as firestoreDoc, getDoc, collection, query, where, getDocs, arrayUnion } from 'firebase/firestore';


interface ShareDialogProps {
  doc: Document;
  children?: ReactNode;
  onPeopleListChange?: (people: FoundUser[]) => void;
}

export type FoundUser = {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
}

export function ShareDialog({ doc, children, onPeopleListChange }: ShareDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dbCollaborators, setDbCollaborators] = useState<FoundUser[]>([]);
  const [owner, setOwner] = useState<FoundUser | null>(null);
  const [isSearching, startSearching] = useTransition();
  const [isAdding, startAdding] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);

  useEffect(() => {
    if (!doc.id) return;
    const docRef = firestoreDoc(db, 'documents', doc.id);

    const unsubscribe = onSnapshot(docRef, async (snap) => {
      const docData = snap.data();
      if (!docData) return;

      const ownerId = docData.userId;
      const collaboratorIds: string[] = docData.collaborators || [];
      const allUserIds = [...new Set([ownerId, ...collaboratorIds].filter(Boolean))];

      if (allUserIds.length > 0) {
        try {
          const userPromises = allUserIds.map(uid => getDoc(firestoreDoc(db, 'users', uid)));
          const userDocs = await Promise.all(userPromises);
          const fetchedUsers = userDocs.filter(d => d.exists()).map(d => d.data() as FoundUser);
          
          const ownerProfile = fetchedUsers.find(u => u.uid === ownerId) || null;
          const collaboratorProfiles = fetchedUsers.filter(u => u.uid !== ownerId);
          
          setOwner(ownerProfile);
          // Set all users, including owner, for the people list
          setDbCollaborators(fetchedUsers);

        } catch (e) {
          console.error("Error fetching user profiles:", e);
          setOwner(null);
          setDbCollaborators([]);
        }
      } else {
        // If no users, try to fetch at least the owner
        if (ownerId) {
             const ownerDoc = await getDoc(firestoreDoc(db, 'users', ownerId));
             if (ownerDoc.exists()) {
                const ownerData = ownerDoc.data() as FoundUser;
                setOwner(ownerData);
                setDbCollaborators([ownerData]);
             }
        } else {
            setOwner(null);
            setDbCollaborators([]);
        }
      }
    });

    return () => unsubscribe();
  }, [doc.id]);


  const peopleWithAccess = useMemo(() => {
    const allPeople = new Map<string, FoundUser>();
    dbCollaborators.forEach(c => allPeople.set(c.uid, c));
    return Array.from(allPeople.values());
  }, [dbCollaborators]);

  useEffect(() => {
    if(onPeopleListChange) {
        onPeopleListChange(peopleWithAccess);
    }
  }, [peopleWithAccess, onPeopleListChange]);


  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            Share
        </Button>
    </DialogTrigger>
  );
  
  const isOwner = user?.uid === doc.userId;

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/documents/${doc.id}` : '';

  const handleSearchUsers = () => {
    if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
    }
    startSearching(async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', searchQuery));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as FoundUser);
        setSearchResults(users);
    });
  }

  const handleAddCollaborator = (collaborator: FoundUser) => {
     if (!user || !collaborator.uid) return;
     startAdding(async () => {
        try {
            const currentDoc = await getDoc(firestoreDoc(db, 'documents', doc.id));
            const currentCollaborators = currentDoc.data()?.collaborators || [];
            if (currentCollaborators.includes(collaborator.uid)) {
                 toast({
                    variant: 'destructive',
                    title: 'User Already Added',
                    description: 'This user already has access to the document.',
                });
                return;
            }

            await updateDocument(doc.id, { collaborators: arrayUnion(collaborator.uid) }, { uid: user.uid, displayName: user.displayName });
            
            // Manually update local state to reflect change immediately
            setDbCollaborators(prev => [...prev, collaborator]);

            toast({
                title: 'Collaborator Added',
                description: 'The user now has access to the document.',
            });
            setSearchQuery('');
            setSearchResults([]);
        } catch(error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add collaborator.',
            });
        }
     });
  }

  return (
    <Dialog>
      {trigger}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{doc.name}"</DialogTitle>
        </DialogHeader>

        {isOwner && (
            <div className="flex items-center space-x-2">
                <Input 
                    id="user-search" 
                    placeholder="Enter user email to invite..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
                <Button onClick={handleSearchUsers} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Invite
                </Button>
            </div>
        )}

        {searchResults.length > 0 && (
            <div className="space-y-2">
                <Label>Search Results</Label>
                <div className="space-y-2 rounded-md border p-2">
                    {searchResults.map(foundUser => (
                        <div key={foundUser.uid} className="flex items-center justify-between">
                            <span>{foundUser.displayName} ({foundUser.email})</span>
                             <Button size="sm" onClick={() => handleAddCollaborator(foundUser)} disabled={isAdding || peopleWithAccess.some(p => p.uid === foundUser.uid)}>
                                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Editor
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        <div className="space-y-2">
            <Label>People with access</Label>
             <div className="space-y-4">
                {peopleWithAccess.map(person => (
                     <div key={person.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                {person.photoURL && <AvatarImage src={person.photoURL} alt={person.displayName} />}
                                <AvatarFallback>{person.displayName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="text-sm font-medium">{person.displayName}</span>
                                <div className='flex items-center gap-2'>
                                   <span className="text-xs text-muted-foreground">{person.email}</span>
                                </div>
                            </div>
                        </div>
                         <span className="text-sm text-muted-foreground">
                            {person.uid === doc.userId ? 'Owner' : 'Editor'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
        <Separator />
        <DialogHeader>
             <DialogTitle className="text-base">Get Link</DialogTitle>
              <DialogDescription>
                Anyone with the link can view and edit this document.
              </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={shareLink} readOnly />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText(shareLink)}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
