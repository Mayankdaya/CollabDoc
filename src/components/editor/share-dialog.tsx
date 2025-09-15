
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
import { UserProfile, getUsersForDocument } from '@/app/users/actions';


interface ShareDialogProps {
  doc: Document;
  children?: ReactNode;
  onCollaboratorAdded?: () => void;
}

export function ShareDialog({ doc, children, onCollaboratorAdded }: ShareDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [peopleWithAccess, setPeopleWithAccess] = useState<UserProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const [isSearching, startSearching] = useTransition();
  const [isAdding, startAdding] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (isOpen && doc.id) {
        getUsersForDocument(doc.id).then(setPeopleWithAccess);
    }
  }, [doc.id, isOpen]);

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
        const q = query(usersRef, where('email', '==', searchQuery.trim().toLowerCase()));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        setSearchResults(users);
    });
  }

  const handleAddCollaborator = (collaborator: UserProfile) => {
     if (!user || !collaborator.uid) return;
     startAdding(async () => {
        try {
            const currentDoc = await getDoc(firestoreDoc(db, 'documents', doc.id));
            const currentCollaborators = currentDoc.data()?.collaborators || [];
            if (currentCollaborators.includes(collaborator.uid) || doc.userId === collaborator.uid) {
                 toast({
                    variant: 'destructive',
                    title: 'User Already Added',
                    description: 'This user already has access to the document.',
                });
                return;
            }

            await updateDocument(doc.id, { collaborators: arrayUnion(collaborator.uid) }, { uid: user.uid, displayName: user.displayName });
            
            setPeopleWithAccess(prev => [...prev, collaborator]);

            toast({
                title: 'Collaborator Added',
                description: 'The user now has access to the document.',
            });
            setSearchQuery('');
            setSearchResults([]);
            if (onCollaboratorAdded) {
                onCollaboratorAdded();
            }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
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
             <div className="space-y-4 max-h-48 overflow-y-auto">
                {peopleWithAccess.map(person => (
                     <div key={person.uid} className="flex items-center justify-between pr-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                {person.photoURL && <AvatarImage src={person.photoURL} alt={person.displayName || undefined} />}
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
