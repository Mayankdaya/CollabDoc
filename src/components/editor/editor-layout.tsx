
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import type { Document as DocType } from '@/app/documents/actions';
import { useAuth } from '@/hooks/use-auth';
import { YFireProvider } from '@/lib/y-fire';
import { Loader2 } from 'lucide-react';
import { MicrosoftWordEditor } from './microsoft-word-editor';
import { db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import * as Y from 'yjs';


interface EditorLayoutProps {
  documentId: string;
  initialData: DocType;
}

export default function EditorLayout({ documentId, initialData }: EditorLayoutProps) {
  const { user, loading } = useAuth();
  const [editor, setEditor] = useState<Editor | null>(null);
  
  const { ydoc, provider } = useMemo(() => {
    const docY = new Y.Doc();
    const docRef = doc(collection(db, 'documents_data'), documentId);
    const fireProvider = new YFireProvider(docRef, docY);

    return { ydoc: docY, provider: fireProvider };
  }, [documentId]);
  
  const [content, setContent] = useState(initialData.content);

  useEffect(() => {
    if (!provider || !ydoc) return;
    
    const type = ydoc.getText('content');
    
    const handleUpdate = () => {
        const newContent = type.toString();
        setContent(newContent);
    };

    type.observe(handleUpdate);

    // Set initial content if document is new/empty
    if (type.length === 0 && initialData.content) {
        type.insert(0, initialData.content);
    } else {
        setContent(type.toString());
    }

    return () => {
        type.unobserve(handleUpdate);
    };
  }, [ydoc, provider, initialData.content]);


  if (loading || !provider) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading editor...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-screen w-full">
        <MicrosoftWordEditor content={content} onContentChange={(newContent) => {
            if(ydoc) {
                const type = ydoc.getText('content');
                // Basic diffing to avoid replacing the whole content on every keystroke
                if (type.toString() !== newContent) {
                    type.delete(0, type.length);
                    type.insert(0, newContent);
                }
            }
        }} />
    </div>
  );
}
