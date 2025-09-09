
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Editor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EditorHeader from './editor-header';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { EditorToolbar } from './editor-toolbar';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import { FontSize } from './font-size-extenstion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import type { Document as DocType } from '@/app/documents/actions';
import { updateDocument } from '@/app/documents/actions';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData, collection, doc as firestoreDoc } from "firebase/firestore";
import { useAuth } from '@/hooks/use-auth';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { YFireProvider } from 'y-fire';
import type { Awareness } from 'y-protocols/awareness';
import { Loader2 } from 'lucide-react';

interface EditorLayoutProps {
  documentId: string;
  initialData: DocType;
}

const ChatPanel = dynamic(() => import('./chat-panel'), { ssr: false, loading: () => <div className="p-4"><Loader2 className="animate-spin" /></div> });
const AiChatPanel = dynamic(() => import('./ai-chat-panel'), { ssr: false, loading: () => <div className="p-4"><Loader2 className="animate-spin" /></div> });
const TeamPanel = dynamic(() => import('./team-panel'), { ssr: false, loading: () => <div className="p-4"><Loader2 className="animate-spin" /></div> });


function getAnonymousName() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        const storedName = window.sessionStorage.getItem('anonymous-username');
        if (storedName) {
            return storedName;
        }
        const adjectives = ["Agile", "Bright", "Creative", "Dapper", "Eager", "Flying", "Giant", "Happy", "Invisible", "Jumping", "Keen", "Leaping"];
        const animals = ["Aardvark", "Bear", "Capybara", "Dolphin", "Echidna", "Frog", "Giraffe", "Hippo", "Iguana", "Jaguar", "Koala", "Lemur"];
        const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
        window.sessionStorage.setItem('anonymous-username', randomName);
        return randomName;
    }
    return "Anonymous User";
}


export default function EditorLayout({ documentId, initialData }: EditorLayoutProps) {
  const { user, loading } = useAuth();
  const [editor, setEditor] = useState<Editor | null>(null);
  
  const { ydoc, provider } = useMemo(() => {
    const doc = new Y.Doc();
    const docRef = firestoreDoc(collection(db, 'documents_data'), documentId);
    // Note: The `YFireProvider` uses a different path (`documents_data`) to store the raw Y.js data.
    // This separates it from your main document metadata in the `documents` collection.
    const fireProvider = new YFireProvider(docRef, doc);

    return { ydoc: doc, provider: fireProvider };
  }, [documentId]);
  
  const [wordCount, setWordCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [docName, setDocName] = useState(initialData.name);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>(initialData.lastModified);
  const [lastSavedBy, setLastSavedBy] = useState<string>(initialData.lastModifiedBy);
  
  const { toast } = useToast();
  
  const saveDocument = useCallback(() => {
    if (!user || !editor || editor.isDestroyed) return;
  
    setIsSaving(true);
      
    // With y-fire, saving content is more about metadata updates.
    // The Y.js data is synced automatically by the provider.
    // We only need to update our own metadata like lastModified.
    updateDocument(documentId, { }, { uid: user.uid, displayName: user.displayName })
      .then((result) => {
        if (result) {
          setLastSaved(result.lastModified);
          setLastSavedBy(result.lastModifiedBy);
        }
      })
      .catch((error) => {
        console.error("Error saving document:", error);
        toast({
          variant: "destructive",
          title: "Error Saving Document",
          description: "Could not save the document.",
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [user, editor, documentId, toast]);

  useEffect(() => {
    let saveTimeout: NodeJS.Timeout;
    
    const handleUpdate = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDocument, 2000); // Save after 2s of inactivity
    };

    editor?.on('update', handleUpdate);

    return () => {
        editor?.off('update', handleUpdate);
        clearTimeout(saveTimeout);
    };
  }, [editor, saveDocument]);


  useEffect(() => {
    if (loading) return; // Wait for user auth to be ready
    
    const collaborationUserName = user?.displayName || getAnonymousName();
    const userColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    if (provider && provider.awareness) {
        provider.awareness.setLocalStateField('user', {
            name: collaborationUserName,
            color: userColor,
        });
    }
    
    const tiptapEditor = new Editor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] }, history: false }),
            Placeholder.configure({ placeholder: 'Start writing your document...' }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            FontFamily,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider: provider,
                user: { 
                  name: collaborationUserName,
                  color: userColor,
                },
            }),
        ],
        // Content is now managed by Y.js through the provider
        editorProps: {
            attributes: { class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-12 focus:outline-none min-h-[calc(100vh-250px)]' },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
        },
        editable: true,
    });

    setEditor(tiptapEditor);

    return () => {
        if (provider) {
          provider.destroy();
        }
        if (tiptapEditor && !tiptapEditor.isDestroyed) {
          tiptapEditor.destroy();
        }
    };
  }, [documentId, user, loading, ydoc, provider]);


  const handleDocumentSnapshot = useCallback((doc: DocumentData) => {
    if (doc.exists()) {
      const data = doc.data();
      setDocName(data.name || '');
      if (data.lastModified) {
        const lastModifiedDate = data.lastModified?.toDate ? data.lastModified.toDate() : new Date(data.lastModified);
        setLastSaved(lastModifiedDate.toISOString());
      }
      if (data.lastModifiedBy) setLastSavedBy(data.lastModifiedBy);
    }
  }, []);

  useEffect(() => {
    if (!documentId) return;
    const docRef = doc(db, "documents", documentId);
    const unsubscribe = onSnapshot(docRef, (doc) => handleDocumentSnapshot(doc));
    return () => unsubscribe();
  }, [documentId, handleDocumentSnapshot]);
  
  const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(prev + 0.1, 2)), []);
  const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5)), []);


  if (!editor || loading || !provider) {
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
    <div className={cn("flex h-screen w-full flex-col", "editor-page-background")}>
      <EditorHeader 
        doc={initialData}
        editor={editor}
        awareness={provider.awareness}
        docName={docName}
        setDocName={setDocName}
        isSaving={isSaving}
        lastSaved={lastSaved}
        lastSavedBy={lastSavedBy}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/50 shadow-2xl backdrop-blur-md">
                <EditorToolbar 
                  editor={editor} 
                  wordCount={wordCount}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  docName={docName}
                  doc={initialData}
                />
                <div className="p-4 sm:p-8 md:p-12 min-h-[calc(100vh-260px)]">
                  <div className="min-h-full bg-transparent" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
                    <EditorContent editor={editor} id="editor" />
                  </div>
                </div>
            </div>
          </div>
        </main>
        <aside className="w-96 flex-shrink-0 border-l border-white/10 bg-black/30 p-0 backdrop-blur-xl hidden lg:block">
            <Tabs defaultValue="chat" className="flex h-full flex-col">
                <TabsList className="px-4 justify-start rounded-none border-b border-white/20">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="flex-1 overflow-y-auto p-0 m-0">
                    <ChatPanel documentId={documentId} />
                </TabsContent>
                <TabsContent value="ai-chat" className="flex-1 overflow-y-auto m-0">
                    <AiChatPanel documentContent={editor?.getHTML() || ''} editor={editor} />
                </TabsContent>
                <TabsContent value="team" className="flex-1 overflow-y-auto m-0">
                    <TeamPanel doc={initialData} awareness={provider.awareness} />
                </TabsContent>
            </Tabs>
        </aside>
      </div>
    </div>
  );
}
