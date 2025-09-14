
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent, Editor as EditorClass, generateJSON } from '@tiptap/react';
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
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { FontSize } from './extensions/font-size';
import { LineHeight } from './extensions/line-height';
import { useAuth } from '@/hooks/use-auth';
import * as Y from 'yjs';
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
import { CallPanel } from './call-panel';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react/suspense';
import { LiveblocksYjsProvider }d from '@liveblocks/yjs';
import { Loader2 } from 'lucide-react';
import { useRoom } from '@/liveblocks.config';
import { yDocToProsemirrorJSON } from 'y-prosemirror';


function EditorLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2">Connecting to editor...</p>
    </div>
  );
}

interface EditorCoreProps {
  documentId: string;
  initialData: Doc;
  setCallState: (state: any) => void;
  docName: string;
  setDocName: (name: string) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  lastSaved: string;
  setLastSaved: (saved: string) => void;
  lastSavedBy: string;
  setLastSavedBy: (name: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

const EditorCore = ({
  documentId,
  initialData,
  setCallState,
  docName,
  setDocName,
  isSaving,
  setIsSaving,
  lastSaved,
  setLastSaved,
  lastSavedBy,
  setLastSavedBy,
  zoom,
  setZoom
}: EditorCoreProps) => {
  const room = useRoom();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editor, setEditor] = useState<EditorClass | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  const handleAutoSave = useCallback(
    async (currentContent: string) => {
      if (!user) return;
      
      setIsSaving(true);
      try {
        const result = await updateDocument(documentId, { content: currentContent }, { uid: user.uid, displayName: user.displayName });
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
    [documentId, user, toast, setIsSaving, setLastSaved, setLastSavedBy]
  );
  
  const extensions = useMemo(() => [
    StarterKit.configure({ history: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle, FontFamily, FontSize, LineHeight, Color,
    Highlight.configure({ multicolor: true }),
    Underline,
    Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    Image,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Start typing...' }),
    History, Gapcursor, Dropcursor, Blockquote, CodeBlock, CharacterCount,
    TaskList, TaskItem.configure({ nested: true }),
  ], []);

  useEffect(() => {
    if (!room || !user || editor) {
      return;
    }

    const ydoc = new Y.Doc();
    const newProvider = new LiveblocksYjsProvider(room, ydoc);
    setProvider(newProvider);

    const collaborationExtensions = [
      Collaboration.configure({
        document: ydoc,
        field: 'prosemirror',
      }),
      CollaborationCursor.configure({
        provider: newProvider,
        user: {
          name: user?.displayName || 'Anonymous',
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      }),
    ];

    const allExtensions = [...extensions, ...collaborationExtensions];

    const newEditor = new EditorClass({
      extensions: allExtensions,
      editorProps: {
        attributes: {
          class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-full',
        },
      },
      // DO NOT PASS CONTENT HERE. The collaboration extension will handle it.
      onUpdate: ({ editor: updatedEditor }) => {
        handleAutoSave(updatedEditor.getHTML());
      },
    });

    setEditor(newEditor);

    newProvider.on('synced', (isSynced: boolean) => {
      if (isSynced) {
        const yDocFragment = ydoc.getXmlFragment('prosemirror');
        const prosemirrorContent = yDocToProsemirrorJSON(yDocFragment);

        if (!newEditor.isDestroyed && yDocFragment.length === 0) {
          // Document is empty, populate from initial data
          const tempEditor = new EditorClass({
            extensions,
            content: initialData.content,
          });
          const prosemirrorJson = tempEditor.getJSON();
          const yjsUpdate = Y.encodeStateAsUpdate(
            prosemirrorJSONToYDoc(extensions, prosemirrorJson)
          );
          Y.applyUpdate(ydoc, yjsUpdate);
          tempEditor.destroy();
        }
      }
    });

    return () => {
      newProvider.destroy();
      ydoc.destroy();
      editor?.destroy();
      setEditor(null);
      setProvider(null);
    };
  }, [room, user, extensions, handleAutoSave, initialData.content, editor]);


  if (!editor || !provider) {
    return <EditorLoading />;
  }

  const wordCount = editor?.storage.characterCount.words() || 0;
  const awareness = provider.awareness;

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
        <EditorHeader 
            doc={initialData} 
            editor={editor}
            awareness={awareness}
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
                    <TeamPanel 
                        doc={initialData} 
                        awareness={awareness}
                        onStartCall={(user, type) => setCallState({ active: true, user, type })}
                    />
                </TabsContent>
            </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}


interface EditorLayoutProps {
  documentId: string;
  initialData: Doc;
}

export function EditorLayout({ documentId, initialData }: EditorLayoutProps) {
  const [zoom, setZoom] = useState(1);
  const [docName, setDocName] = useState(initialData.name);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(initialData.lastModified);
  const [lastSavedBy, setLastSavedBy] = useState(initialData.lastModifiedBy);
  const [callState, setCallState] = useState<{ active: boolean; type: 'voice' | 'video' | null; user: any | null }>({
    active: false,
    type: null,
    user: null,
  });

  return (
    <LiveblocksProvider publicApiKey={"pk_dev_W4eVr8avX7cJ_dC1Q1XKAhfY_2qiTOjSHCRgaeovMLrjAB0aHCDuoVZ_AETFGgik"}>
      <RoomProvider id={documentId}>
        <ClientSideSuspense fallback={<EditorLoading />}>
          <div className="flex flex-col h-screen">
             {callState.active && (
                <CallPanel
                    callState={callState}
                    onEndCall={() => setCallState({ active: false, type: null, user: null })}
                />
             )}
            <EditorCore
              documentId={documentId}
              initialData={initialData}
              setCallState={setCallState}
              docName={docName}
              setDocName={setDocName}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              lastSaved={lastSaved}
              setLastSaved={setLastSaved}
              lastSavedBy={lastSavedBy}
              setLastSavedBy={setLastSavedBy}
              zoom={zoom}
              setZoom={setZoom}
            />
          </div>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

    