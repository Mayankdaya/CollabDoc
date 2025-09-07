
import { Copy, UserPlus, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { ReactNode, useState, useTransition, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Document } from '@/app/documents/actions';
import { db } from '@/lib/firebase';
import { onSnapshot, doc as firestoreDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';


interface ShareDialogProps {
  doc: Document;
  children?: ReactNode;
}

type FoundUser = {
    uid: string;
    displayName: string;
    email: string;
}

export function ShareDialog({ doc, children }: ShareDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dbCollaborators, setDbCollaborators] = useState<FoundUser[]>([]);
  const [owner, setOwner] = useState<FoundUser | null>(null);

   useEffect(() => {
    if (!doc.id) return;
    const docRef = firestoreDoc(db, 'documents', doc.id);

    const unsubscribe = onSnapshot(docRef, async (snap) => {
        const docData = snap.data();
        if (!docData) return;

        // Fetch owner info
        if (docData.userId && (!owner || owner.uid !== docData.userId)) {
            try {
                const userRef = firestoreDoc(db, 'users', docData.userId);
                const userSnap = await getDoc(userRef);
                if(userSnap.exists()) {
                    setOwner(userSnap.data() as FoundUser);
                }
            } catch(e) { console.error(e)}
        }
        
        // Fetch collaborator info
        if (docData.collaborators && docData.collaborators.length > 0) {
            try {
                const collaboratorQuery = query(collection(db, 'users'), where('uid', 'in', docData.collaborators));
                const collaboratorSnapshots = await getDocs(collaboratorQuery);
                const collaboratorData = collaboratorSnapshots.docs
                    .map(doc => doc.data() as FoundUser)
                    .filter(Boolean);
                setDbCollaborators(collaboratorData);
            } catch(e) {console.error(e)}
        } else {
            setDbCollaborators([]);
        }
    });

    return () => unsubscribe();
  }, [doc.id, owner]);


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

  const peopleWithAccess = useMemo(() => {
    const allPeople = new Map<string, FoundUser>();
    if (owner) {
        allPeople.set(owner.uid, owner);
    }
    dbCollaborators.forEach(c => allPeople.set(c.uid, c));
    return Array.from(allPeople.values());
  }, [owner, dbCollaborators]);
  
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/documents/${doc.id}` : '';

  return (
    <Dialog>
      {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{doc.name}"</DialogTitle>
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
        
        <Separator />
        <div className="space-y-2">
            <Label>People with access</Label>
             <div className="space-y-4">
                {peopleWithAccess.map(person => (
                     <div key={person.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
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
      </DialogContent>
    </Dialog>
  );
}
