
"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, SendHorizonal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from '@/app/documents/[id]/actions';

interface ChatPanelProps {
  documentId: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Timestamp | null;
  userId: string;
  userName: string;
  userAvatar: string | null;
}

export default function ChatPanel({ documentId }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!documentId) return;

    const messagesRef = collection(db, 'documents', documentId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [documentId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    startTransition(async () => {
        try {
            await sendMessage({
                documentId,
                message: newMessage,
                user: {
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                }
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send message.'
            });
        }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className='p-4 border-b border-white/30'>
        <h2 className="font-headline text-lg font-semibold">Document Chat</h2>
        <p className="text-sm text-muted-foreground">Discuss the document in real-time.</p>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                {msg.userAvatar && <AvatarImage src={msg.userAvatar} alt={msg.userName}/>}
                <AvatarFallback>{msg.userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                 <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold">{msg.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
           {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                    No messages yet. Start the conversation!
                </div>
            )}
        </div>
      </ScrollArea>
       <div className="border-t border-white/30 p-4">
            <div className="relative">
                <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="pr-12 min-h-[60px] bg-black/20 border-white/20 placeholder:text-muted-foreground backdrop-blur-md"
                    disabled={isSending || !user}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim() || !user}
                >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                </Button>
            </div>
            {!user && <p className="text-xs text-destructive mt-2">You must be logged in to chat.</p>}
        </div>
    </div>
  );
}
