
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor as EditorClass } from '@tiptap/react';
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
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
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
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import { Loader2 } from 'lucide-react';
import { useRoom } from '@/liveblocks.config';
import type { FoundUser } from './share-dialog';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

function EditorLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-2">Connecting to editor...</p>
    </div>
  );
}

interface EditorLayoutProps {
  documentId: string;
  initialData: Doc;
}

function EditorCore({ documentId, initialData }: EditorLayoutProps) {
    const room = useRoom();
    const { user } = useAuth();
    const { toast } = useToast();

    const [editor, setEditor] = useState<EditorClass | null>(null);
    const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

    const [docName, setDocName] = useState(initialData.name);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(initialData.lastModified);
    const [lastSavedBy, setLastSavedBy] = useState(initialData.lastModifiedBy);
    const [callState, setCallState] = useState<{ active: boolean; type: 'voice' | 'video' | null; user: any | null }>({
        active: false,
        type: null,
        user: null,
    });
    
    const [peopleWithAccess, setPeopleWithAccess] = useState<FoundUser[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [onlineUserUIDs, setOnlineUserUIDs] = useState<string[]>([]);

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
        [documentId, user, toast]
    );

    const handlePeopleListChange = useCallback((people: FoundUser[]) => {
      setPeopleWithAccess(people);
    }, []);


    useEffect(() => {
        const fetchUsers = async () => {
            const docRef = doc(db, 'documents', documentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const docData = docSnap.data();
                const ownerId = docData.userId;
                const collaboratorIds = docData.collaborators || [];
                const allUserIds = [...new Set([ownerId, ...collaboratorIds].filter(Boolean))];

                if (allUserIds.length > 0) {
                    try {
                        const usersQuery = query(collection(db, 'users'), where('uid', 'in', allUserIds));
                        const userDocs = await getDocs(usersQuery);
                        const fetchedUsers = userDocs.docs.map(d => d.data() as FoundUser);
                        setPeopleWithAccess(fetchedUsers);
                    } catch (error) {
                        console.error("Error fetching user profiles:", error);
                    }
                }
            }
        };

        fetchUsers();
    }, [documentId]);


    useEffect(() => {
        if (!room || !user) return;

        let ydoc: Y.Doc;
        let newProvider: LiveblocksYjsProvider;
        let newEditor: EditorClass;

        if (provider && editor) {
             // Already initialized
            const awareness = provider.awareness;
             const updateOnlineUsers = () => {
                const states = Array.from(awareness.getStates().values());
                const users = states
                    .map((state) => state.user)
                    .filter((user): user is { name: string; color: string; uid: string, clientId: number } => user !== null && !!user.uid);
                
                const uniqueUsers = Array.from(new Map(users.map(u => [u.uid, u])).values());
                setOnlineUsers(uniqueUsers);
                setOnlineUserUIDs(uniqueUsers.map(u => u.uid));
            };
            awareness.on('change', updateOnlineUsers);
            updateOnlineUsers();
            return () => {
                 awareness.off('change', updateOnlineUsers);
            }

        } else {
            ydoc = new Y.Doc();
            newProvider = new LiveblocksYjsProvider(room, ydoc);
            setProvider(newProvider);

            const awareness = newProvider.awareness;
            const updateOnlineUsers = () => {
                const states = Array.from(awareness.getStates().values());
                const users = states
                    .map((state) => state.user)
                    .filter((user): user is { name: string; color: string; uid: string, clientId: number } => user !== null && !!user.uid);
                
                const uniqueUsers = Array.from(new Map(users.map(u => [u.uid, u])).values());
                setOnlineUsers(uniqueUsers);
                setOnlineUserUIDs(uniqueUsers.map(u => u.uid));
            };
            awareness.on('change', updateOnlineUsers);
            updateOnlineUsers();


            newEditor = new EditorClass({
                extensions: [
                    StarterKit.configure({ 
                        history: false,
                    }),
                    TextAlign.configure({ types: ['heading', 'paragraph'] }),
                    TextStyle, FontFamily, FontSize, LineHeight, Color,
                    Highlight.configure({ multicolor: true }),
                    Underline,
                    Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
                    Image,
                    Link.configure({ openOnClick: false }),
                    Placeholder.configure({ placeholder: 'Start typing...' }),
                    CharacterCount,
                    TaskList, TaskItem.configure({ nested: true }),
                    Collaboration.configure({
                        document: ydoc,
                    }),
                    CollaborationCursor.configure({
                        provider: newProvider,
                        user: {
                            name: user?.displayName || 'Anonymous',
                            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                            uid: user.uid,
                        },
                    })
                ],
                editorProps: {
                    attributes: {
                        class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-full',
                    },
                },
            });
            
            setEditor(newEditor);
            
            const handleSync = () => {
                if (newProvider.synced && newEditor && !newEditor.isDestroyed) {
                    const yDocFragment = ydoc.get('prosemirror', Y.XmlFragment);
                    if (yDocFragment.length === 0 && initialData.content) {
                        newEditor.commands.setContent(initialData.content, false);
                    }
                }
            };

            newProvider.on('synced', handleSync);
            handleSync();

            return () => {
                awareness.off('change', updateOnlineUsers);
                newProvider.off('synced', handleSync);
                ydoc.destroy();
                newProvider.destroy();
                newEditor.destroy();
            }
        }
    }, [room, user]);

    useEffect(() => {
        if (!editor || !provider) return;

        let timeoutId: NodeJS.Timeout;

        const updateHandler = ({ editor: updatedEditor }: { editor: EditorClass }) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleAutoSave(updatedEditor.getHTML());
            }, 1000); // Debounce for 1 second
        };

        editor.on('update', updateHandler);

        return () => {
            clearTimeout(timeoutId);
            editor.off('update', updateHandler);
        };
    }, [editor, provider, handleAutoSave]);

    if (!editor || !provider) {
        return <EditorLoading />;
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <CallPanel
                callState={callState}
                onEndCall={() => setCallState({ active: false, type: null, user: null })}
            />
            <EditorHeader 
                doc={initialData} 
                editor={editor}
                onlineUsers={onlineUsers}
                docName={docName}
                setDocName={setDocName}
                isSaving={isSaving}
                lastSaved={lastSaved}
                lastSavedBy={lastSavedBy}
                onPeopleListChange={handlePeopleListChange}
            />
            <EditorToolbar 
                editor={editor} 
                wordCount={editor.storage.characterCount.words() || 0}
                onZoomIn={() => {}}
                onZoomOut={() => {}}
                docName={docName}
                doc={initialData}
            />
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                <ResizablePanel defaultSize={75} id="editor-panel" className="flex flex-col overflow-hidden">
                     <div className="flex-1 overflow-auto p-4 sm:p-8 editor-page-background">
                        <div className="mx-auto bg-card shadow-lg p-[1in]" style={{width: '8.5in', minHeight: '11in'}}>
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} maxSize={40} minSize={20} className="flex flex-col">
                    <Tabs defaultValue="team" className="flex flex-col flex-1 min-h-0">
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
                                peopleWithAccess={peopleWithAccess}
                                onlineUserUIDs={onlineUserUIDs}
                                onStartCall={(user, type) => setCallState({ active: true, user, type })}
                            />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

export function EditorLayout({ documentId, initialData }: EditorLayoutProps) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_W4eVr8avX7cJ_dC1Q1XKAhfY_2qiTOjSHCRgaeovMLrjAB0aHCDuoVZ_AETFGgik"}>
      <RoomProvider id={documentId}>
        <ClientSideSuspense fallback={<EditorLoading />}>
          <EditorCore documentId={documentId} initialData={initialData} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
