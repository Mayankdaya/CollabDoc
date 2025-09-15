
"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { Loader2, SendHorizonal, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { chat, generateDocumentFromTopic } from '@/app/documents/[id]/actions';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { Editor } from '@tiptap/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type Message = z.infer<typeof ChatMessageSchema>;


interface AiChatPanelProps {
    documentContent: string;
    editor: Editor | null;
}

export default function AiChatPanel({ documentContent, editor }: AiChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const handleEditorUpdate = (newContent?: string) => {
        if (editor && newContent !== undefined) {
             editor.chain().focus().setContent(newContent).run();
        }
    };


    const handleSendMessage = () => {
        if (!input.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');

        startTransition(async () => {
            try {
                const result = await chat({
                    history: newMessages.slice(0, -1),
                    message: currentInput,
                    documentContent, // documentContent is not used in chat flow anymore but action expects it
                });
                
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    content: result.response,
                }]);

            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error getting response',
                    description: error instanceof Error ? error.message : 'An unknown error occurred.',
                });
                setMessages(prev => prev.slice(0, -1));
            }
        });
    };

    const handleGenerateContent = () => {
        if (!input.trim() || !editor) return;

        const topic = input;
        setInput('');
        
        // Add a user message to show what was requested
        setMessages(prev => [...prev, { role: 'user', content: `Generate a document about: ${topic}` }]);

        startTransition(async () => {
             try {
                const result = await generateDocumentFromTopic({ topic });

                if (result && result.documentContent) {
                    handleEditorUpdate(result.documentContent);
                    setMessages(prev => [...prev, { role: 'model', content: "I've updated the document for you." }]);
                    toast({
                        title: 'Content Generated',
                        description: 'The document has been updated with the new content.',
                    });
                } else {
                     const errorMessage = result?.documentContent || "I couldn't generate content for that topic.";
                    setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Error generating content',
                    description: error instanceof Error ? error.message : 'An unknown error occurred.',
                });
                setMessages(prev => prev.slice(0, -1)); // remove user message on error
            }
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            // We are disabling send on enter to prevent accidental API calls.
            // handleSendMessage();
        }
    }


    return (
        <div className="flex h-full flex-col">
            <div className='p-4 border-b border-white/30'>
                 <h2 className="font-headline text-lg font-semibold">AI Assistant</h2>
                 <p className="text-sm text-muted-foreground">Chat with the AI or enter a topic and click Generate.</p>
            </div>
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="space-y-4 p-4">
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                             {message.role === 'model' && (
                                <Avatar className="h-8 w-8 bg-gradient-to-br from-primary/70 to-primary/40 border border-primary/50">
                                    <AvatarFallback className="bg-transparent"><Sparkles className="h-5 w-5 text-primary-foreground"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "rounded-lg p-3 max-w-sm backdrop-blur-md", 
                                message.role === 'user' 
                                    ? 'bg-white/10 border border-white/20 text-foreground'
                                    : 'bg-black/10 border border-white/10 backdrop-blur-xl'
                            )}>
                                <div className="prose prose-sm dark:prose-invert text-foreground">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                             {message.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isPending && (
                         <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 bg-gradient-to-br from-primary/70 to-primary/40 border border-primary/50">
                                <AvatarFallback className="bg-transparent"><Sparkles className="h-5 w-5 text-primary-foreground"/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 bg-black/10 border border-white/20 backdrop-blur-sm flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className='text-sm text-muted-foreground italic'>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="border-t border-white/30 p-4 space-y-2">
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Chat with the AI or enter a topic to generate..."
                        className="pr-12 min-h-[60px] bg-black/20 border-white/20 placeholder:text-muted-foreground backdrop-blur-md"
                        disabled={isPending}
                    />
                </div>
                <div className='flex items-center gap-2'>
                     <Button 
                        type="submit" 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={isPending || !input.trim()}
                        title="Send Chat Message"
                        className="flex-1"
                    >
                        <SendHorizonal className="h-5 w-5" />
                         <span className="sr-only sm:not-sr-only sm:ml-2">Send</span>
                    </Button>
                    <Button 
                        type="button"
                        className='flex-1'
                        onClick={handleGenerateContent}
                        disabled={isPending || !input.trim()}
                        title="Generate Document from Topic"
                    >
                        <Wand2 className="h-5 w-5" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Generate</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
