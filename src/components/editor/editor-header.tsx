
'use client';

import Link from 'next/link';
import { ChevronLeft, History, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Editor } from '@tiptap/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShareDialog } from './share-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserMenu } from '../user-menu';
import { updateDocument } from '@/app/documents/actions';
import type { Document } from '@/app/documents/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useAuth } from '@/hooks/use-auth';

interface EditorHeaderProps {
  doc: Document;
  editor: Editor | null;
  onlineUsers: any[];
  docName: string;
  setDocName: (name: string) => void;
  isSaving: boolean;
  lastSaved: string;
  lastSavedBy: string;
  onPeopleListChange: () => void;
}

export default function EditorHeader({ doc, editor, onlineUsers, docName, setDocName, isSaving, lastSaved, lastSavedBy, onPeopleListChange }: EditorHeaderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleNameChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!user) return;
    const newName = e.target.value;
    setDocName(newName);
    try {
        await updateDocument(doc.id, { name: newName }, { uid: user.uid, displayName: user.displayName });
         toast({
            title: "Name Updated",
            description: "Document name saved.",
        });
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save document name.",
        });
    }
  }
  
  const lastSavedTime = lastSaved
    ? formatDistanceToNow(new Date(lastSaved), { addSuffix: true })
    : 'a few seconds ago';


  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-16 flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 border-b border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl md:px-6">
      <div className="flex w-full sm:w-auto items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <div className="flex-1 sm:hidden">
            <UserMenu />
        </div>
      </div>


      <div className="flex-1 w-full sm:w-auto">
        <Input
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          onBlur={handleNameChange}
          className="w-full border-0 bg-transparent text-lg font-semibold shadow-none focus-visible:ring-0 md:w-auto p-0 h-auto"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>
                Saved {lastSavedTime} by {lastSavedBy}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex w-full sm:w-auto items-center justify-end gap-1 sm:gap-2">
        <TooltipProvider>
          <div className="flex -space-x-2">
            {onlineUsers.map((c) => (
              <Tooltip key={c.uid}>
                  <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2" style={{ borderColor: c.color }}>
                          <AvatarFallback style={{ backgroundColor: c.color, color: 'white' }}>
                              {c.name?.charAt(0).toUpperCase() || 'A'}
                          </AvatarFallback>
                      </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>{c.name}</p>
                  </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        <Separator orientation="vertical" className="h-8 mx-1 sm:mx-2" />

        <ShareDialog doc={doc} onCollaboratorAdded={onPeopleListChange} />
        <div className='hidden sm:block'>
            <UserMenu />
        </div>
      </div>
    </header>
  );
}
