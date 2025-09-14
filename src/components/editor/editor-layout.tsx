
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';
import Gapcursor from '@tiptap/extension-gapcursor';
import Dropcursor from '@tiptap/extension-dropcursor';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import CharacterCount from '@tiptap/extension-character-count';
import { FontSize } from './extensions/font-size';
import { LineHeight } from './extensions/line-height';
import { useAuth } from '@/hooks/use-auth';
import * as Y from 'yjs';
import { YFireProvider } from '@/lib/y-fire';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Document as Doc } from '@/app/documents/actions';
import { updateDocument } from '@/app/documents/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './editor-toolbar';
import EditorHeader from './editor-header';
import AiChatPanel from './ai-chat-panel';
import ChatPanel from './chat-panel';
import TeamPanel from './team-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bot, Users } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

interface EditorLayoutProps {
  documentId: string;
  initialData: Doc;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  documentId,
  initialData
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [zoom, setZoom] = useState(1);
  const [docName, setDocName] = useState(initialData.name);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(initialData.lastModified);
  const [lastSavedBy, setLastSavedBy] = useState(initialData.lastModifiedBy);

  const { ydoc, provider } = useMemo(() => {
    const docY = new Y.Doc();
    const docRef = doc(collection(db, 'documents_data'), documentId);
    const fireProvider = new YFireProvider(docRef, docY);
    return { ydoc: docY, provider: fireProvider };
  }, [documentId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontFamily,
      FontSize,
      LineHeight,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      History,
      Gapcursor,
      Dropcursor,
      Blockquote,
      CodeBlock,
      CharacterCount,
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: user?.displayName || 'Anonymous',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
    content: initialData.content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-full',
      },
    },
    onUpdate: ({ editor }) => {
      handleAutoSave(editor.getHTML());
    },
  });
  
  const handleAutoSave = useCallback(
    async (currentContent: string) => {
      if (!user || !editor) return;
      
      setIsSaving(true);
      try {
        const result = await updateDocument(documentId, { content: currentContent }, user);
        if (result.success) {
          setLastSaved(result.lastModified);
          setLastSavedBy(result.lastModifiedBy);
        }
      } catch (error) {
        console.error("Autosave failed", error);
        toast({
            variant: "destructive",
            title: "Autosave Failed",
            description: "Could not save your changes.",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, user, editor, toast]
  );
  
  useEffect(() => {
    return () => {
      ydoc.destroy();
      provider?.destroy();
    };
  }, [ydoc, provider]);

  if (!editor) {
    return null;
  }

  const wordCount = editor?.storage.characterCount.words() || 0;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
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
      
       <EditorToolbar 
        editor={editor} 
        wordCount={wordCount}
        onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
        onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        docName={docName}
        doc={initialData}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel className="flex-1 overflow-auto editor-page-background">
            <div
                className="mx-auto my-8 p-8 sm:p-12"
                style={{
                width: '8.5in',
                minHeight: '11in',
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s',
                }}
            >
                <div className={cn("bg-card shadow-lg p-[1in] min-h-[9in]")}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} maxSize={40} minSize={20}>
            <Tabs defaultValue="chat" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 shrink-0 rounded-none bg-background/30">
                    <TabsTrigger value="chat"><MessageSquare className='h-5 w-5'/><span className='hidden lg:inline-block ml-2'>Chat</span></TabsTrigger>
                    <TabsTrigger value="ai-chat"><Bot className='h-5 w-5'/><span className='hidden lg:inline-block ml-2'>AI</span></TabsTrigger>
                    <TabsTrigger value="team"><Users className='h-5 w-5'/><span className='hidden lg:inline-block ml-2'>Team</span></TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="flex-1 overflow-auto mt-0">
                    <ChatPanel documentId={documentId} />
                </TabsContent>
                <TabsContent value="ai-chat" className="flex-1 overflow-auto mt-0">
                    <AiChatPanel documentContent={editor.getHTML()} editor={editor} />
                </TabsContent>
                <TabsContent value="team" className="flex-1 overflow-auto mt-0">
                    <TeamPanel doc={initialData} awareness={provider.awareness} />
                </TabsContent>
            </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
