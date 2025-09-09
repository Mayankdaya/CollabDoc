
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { useAuth } from '@/hooks/use-auth';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import VideoCallPanel from './video-call-panel';
import Peer from 'simple-peer';
import { Loader2 } from 'lucide-react';

interface EditorLayoutProps {
  documentId: string;
  initialData: DocType;
}

interface PeerData {
    peerID: string;
    peer: Peer.Instance;
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
  
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);

  const [wordCount, setWordCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [docName, setDocName] = useState(initialData.name);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>(initialData.lastModified);
  const [lastSavedBy, setLastSavedBy] = useState<string>(initialData.lastModifiedBy);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [peerStreams, setPeerStreams] = useState<MediaStream[]>([]);
  const peersRef = useRef<PeerData[]>([]);
  const { toast } = useToast();
  
  const saveDocument = useCallback(() => {
    if (!user || !editor || editor.isDestroyed || !ydoc) return;
  
    setIsSaving(true);
    // Encode the entire Y.Doc state as a single update
    const contentString = JSON.stringify(Array.from(Y.encodeStateAsUpdate(ydoc)));
      
    updateDocument(documentId, { content: contentString }, user)
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
  }, [user, editor, documentId, ydoc, toast]);

  useEffect(() => {
    let saveTimeout: NodeJS.Timeout;
    
    const handleUpdate = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDocument, 2000);
    };

    ydoc.on('update', handleUpdate);

    return () => {
        ydoc.off('update', handleUpdate);
        clearTimeout(saveTimeout);
    };
  }, [ydoc, saveDocument]);


  useEffect(() => {
    if (loading) return;

    if (initialData.content && initialData.content.startsWith('[')) {
        try {
            // This is the correct format for Y.js updates
            const initialContentUpdate = new Uint8Array(JSON.parse(initialData.content));
            Y.applyUpdate(ydoc, initialContentUpdate);
        } catch (error) {
            // This is a fallback for potentially old, plain HTML content
             if (editor && !editor.isDestroyed) {
                 editor.commands.setContent(initialData.content, false);
             }
        }
    } else if (initialData.content) {
        // Fallback for old plain HTML content if editor is not ready yet
        const yText = ydoc.getText('content');
        if (yText.length === 0) {
            yText.insert(0, initialData.content);
        }
    }

    const webrtcProvider = new WebrtcProvider(`collab-doc-room-${documentId}`, ydoc, {
        signaling: [
            'wss://y-webrtc-signaling-eu.herokuapp.com',
            'wss://y-webrtc-signaling-us.herokuapp.com'
        ]
    });
    setProvider(webrtcProvider);
    
    const collaborationUserName = user?.displayName || getAnonymousName();
    const userColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    webrtcProvider.awareness.setLocalStateField('user', {
        name: collaborationUserName,
        color: userColor,
    });


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
                provider: webrtcProvider,
                user: { 
                  name: collaborationUserName,
                  color: userColor,
                },
            }),
        ],
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

    const awarenessChangeHandler = () => {
        if (!webrtcProvider) return;
        const states = Array.from(webrtcProvider.awareness.getStates().values());
        const users = states
            .map(state => state.user ? { ...state.user, clientId: Array.from(webrtcProvider.awareness.getStates().entries()).find(([_, s]) => s === state)?.[0] } : null)
            .filter((user): user is { name: string; color: string; clientId: any } => user !== null && !!user.name && user.clientId);
        setOnlineUsers(users);
    };
    
    webrtcProvider.awareness.on('change', awarenessChangeHandler);
    awarenessChangeHandler();


    return () => {
        webrtcProvider?.destroy();
        tiptapEditor?.destroy();
    };
  }, [documentId, user, ydoc, loading, initialData.content]);


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

  const createPeer = useCallback((peerID: number, callerID: number, stream: MediaStream): PeerData | undefined => {
    if(!provider) return;
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => {
        provider?.send('message', { type: 'signal', from: callerID, to: peerID, signal });
    });
    peer.on('stream', (peerStream) => {
        setPeerStreams(prevStreams => [...prevStreams, peerStream]);
    });
    return { peerID: peerID.toString(), peer };
  }, [provider]);

  const addPeer = useCallback((incomingSignal: Peer.SignalData, callerID: number, stream: MediaStream): PeerData | undefined => {
    if (!provider) return;
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => {
         provider?.send('message', { type: 'signal', from: provider.awareness.clientID, to: callerID, signal });
    });
    peer.on('stream', (peerStream) => {
        setPeerStreams(prevStreams => {
            if (prevStreams.some(s => s.id === peerStream.id)) return prevStreams;
            return [...prevStreams, peerStream]
        });
    });
    peer.signal(incomingSignal);
    return { peerID: callerID.toString(), peer };
  }, [provider]);
  
  useEffect(() => {
    if (!provider) return;

    const messageHandler = (message: any) => {
        if (message.type === 'signal' && localStream) {
            const peerData = peersRef.current.find(p => p.peerID === message.from);
            if (peerData) {
                peerData.peer.signal(message.signal);
            } else {
                const newPeer = addPeer(message.signal, message.from, localStream);
                if (newPeer) peersRef.current.push(newPeer);
            }
        }
    };
    provider.on('message', messageHandler);

    return () => {
        provider?.off('message', messageHandler);
    }
  }, [provider, localStream, addPeer]);

  const handleCallStart = useCallback((type: 'audio' | 'video') => {
    if (!provider) {
        toast({ variant: 'destructive', title: 'Collaboration Error', description: 'Could not initialize call. Please refresh the page.' });
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true }).then(stream => {
        setLocalStream(stream);
        setInCall(true);
        const allPeerIds = Array.from(provider.awareness.getStates().keys()).filter(id => id !== provider.awareness.clientID);
        const newPeers = allPeerIds.map(peerID => createPeer(peerID, provider.awareness.clientID, stream)).filter(p => p !== undefined) as PeerData[];
        peersRef.current = newPeers;
    }).catch(err => {
        console.error("Failed to get media", err);
        toast({ variant: 'destructive', title: 'Media Access Denied', description: 'Could not access your camera or microphone.' });
    });
  }, [toast, provider, createPeer]);

  const handleCallEnd = useCallback(() => {
    setInCall(false);
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(undefined);
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current = [];
    setPeerStreams([]);
  }, [localStream]);

  const toggleMedia = useCallback((type: 'audio' | 'video') => {
    if (localStream) {
        const track = type === 'audio' 
            ? localStream.getAudioTracks()[0] 
            : localStream.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
        }
    }
  }, [localStream]);

  if (!editor || loading) {
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
        isSaving={isSaving}
        docName={docName}
        setDocName={setDocName}
        lastSaved={lastSaved}
        lastSavedBy={lastSavedBy}
        onlineUsers={onlineUsers}
        onCallStart={handleCallStart}
        onCallEnd={handleCallEnd}
        inCall={inCall}
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
                    <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
                      <ChatPanel documentId={documentId} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="ai-chat" className="flex-1 overflow-y-auto m-0">
                   <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
                     <AiChatPanel documentContent={editor?.getHTML() || ''} editor={editor} />
                   </Suspense>
                </TabsContent>
                <TabsContent value="team" className="flex-1 overflow-y-auto m-0">
                   <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin" /></div>}>
                     <TeamPanel doc={initialData} onlineUsers={onlineUsers} />
                   </Suspense>
                </TabsContent>
            </Tabs>
        </aside>

        {inCall && (
            <VideoCallPanel
                peerStreams={peerStreams}
                localStream={localStream}
                onCallEnd={handleCallEnd}
                toggleMedia={toggleMedia}
            />
        )}
      </div>
    </div>
  );
}

    