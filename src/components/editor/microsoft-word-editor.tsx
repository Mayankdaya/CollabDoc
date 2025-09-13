'use client';

import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react';
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
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

import { FontSize } from './extensions/font-size';
import { LineHeight } from './extensions/line-height';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Save,
  Printer,
  ZoomIn,
  ZoomOut,
  Strikethrough,
  Palette,
  X,
  Home,
  BookMarked as References,
  Send as Mailings,
  BookCheck as Review,
  Monitor as View,
  LayoutPanelLeft as PageLayoutIcon,
  CaseSensitive as InsertIcon,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Slider } from '@/components/ui/slider';
import * as Y from 'yjs';
import { YFireProvider } from '@/lib/y-fire';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Document as Doc } from '@/app/documents/actions';


interface MicrosoftWordEditorProps {
  documentId: string;
  initialData: Doc;
}

export const MicrosoftWordEditor: React.FC<MicrosoftWordEditorProps> = ({
  documentId,
  initialData
}) => {
  const { user } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState('11');
  
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { ydoc, provider } = React.useMemo(() => {
    const docY = new Y.Doc();
    const docRef = doc(collection(db, 'documents_data'), documentId);
    const fireProvider = new YFireProvider(docRef, docY);

    return { ydoc: docY, provider: fireProvider };
  }, [documentId]);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Use collaboration history
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      Color,
      FontSize.configure({
        types: ['textStyle'],
      }),
      LineHeight.configure({
        types: ['paragraph', 'heading'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document here...',
      }),
      History,
      Gapcursor,
      Dropcursor,
      Blockquote,
      CodeBlock,
      Collaboration.configure({
        document: ydoc,
      }),
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
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    return () => {
      provider?.destroy();
      ydoc?.destroy();
    };
  }, [provider, ydoc]);


  // Font family change
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    if (editor) {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  // Font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    if (editor) {
      editor.chain().focus().setFontSize(size + 'pt').run();
    }
  };


  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };


  if (!isClient || !editor) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <div className="text-gray-500">Loading Microsoft Word Editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground theme-word">
      {/* Microsoft Word Title Bar */}
      <div className="bg-primary text-primary-foreground h-8 flex items-center justify-between px-2 text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">{initialData.name} - Word</span>
        </div>
        <div className="flex items-center space-x-1">
           {/* These are just for show */}
        </div>
      </div>

      {/* Microsoft Word Menu Bar */}
      <div className="bg-card border-b h-10 flex items-center px-4 text-sm">
        <div className="flex items-center space-x-4">
          <Button variant="primary" size="sm" className="h-7 px-3 text-xs bg-primary/10 text-primary-foreground hover:bg-primary/20">File</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Home</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Insert</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Page Layout</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">References</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Mailings</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Review</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">View</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Help</Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{user?.displayName}</p>
        </div>
      </div>

      {/* Microsoft Word Ribbon */}
      <div className="bg-card border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 rounded-none border-b px-2 flex-wrap">
             <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Save className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor?.commands.undo()}><Undo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor?.commands.redo()}><Redo className="h-4 w-4" /></Button>
             </div>
            <div className="flex items-start space-x-1 border-r pr-2 mr-2">
              <div className='flex flex-col items-center'>
                <div className="flex items-center">
                    <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Calibri">Calibri</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                     <Select value={fontSize} onValueChange={handleFontSizeChange}>
                      <SelectTrigger className="w-16 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 36, 48, 72].map(size => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center space-x-1">
                    <Button
                      variant={editor?.isActive('bold') ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => editor?.commands.toggleBold()}
                      className="h-7 w-7 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor?.isActive('italic') ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => editor?.commands.toggleItalic()}
                      className="h-7 w-7 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor?.isActive('underline') ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => editor?.commands.toggleUnderline()}
                      className="h-7 w-7 p-0"
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                     <Button
                      variant={editor?.isActive('strike') ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => editor?.commands.toggleStrike()}
                      className="h-7 w-7 p-0"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                     <Button
                      variant={editor?.isActive('highlight') ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => editor?.commands.toggleHighlight({ color: '#ffff00' })}
                      className="h-7 w-7 p-0"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </div>
            
             <div className="flex items-start space-x-1 border-r pr-2 mr-2">
                <div className='flex flex-col items-center'>
                    <div className="flex items-center space-x-1">
                        <Button
                          variant={editor?.isActive('bulletList') ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.commands.toggleBulletList()}
                          className="h-7 w-7 p-0"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={editor?.isActive('orderedList') ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.commands.toggleOrderedList()}
                          className="h-7 w-7 p-0"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                         <Button
                          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor.chain().focus().toggleBlockquote().run()}
                          className="h-7 w-7 p-0"
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                          className="h-7 w-7 p-0"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="flex items-center space-x-1">
                        <Button
                          variant={editor?.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                          className="h-7 w-7 p-0"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                         <Button
                          variant={editor?.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                          className="h-7 w-7 p-0"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={editor?.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                          className="h-7 w-7 p-0"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                         <Button
                          variant={editor?.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                          className="h-7 w-7 p-0"
                        >
                          <AlignJustify className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
          </TabsList>
        </Tabs>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto bg-muted/40 p-4 sm:p-8 editor-page-background">
        <div 
          className="w-full h-full"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <div className={cn("mx-auto bg-card shadow-lg w-[8.5in] h-[11in] p-[1in]")}>
            
              <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100 }}
                className="bg-card border rounded-lg shadow-lg p-1 flex items-center space-x-1"
              >
                <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </BubbleMenu>

              <EditorContent editor={editor} />
            
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t h-6 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Page 1 of 1</span>
          <span>Words: {editor?.storage.characterCount.words() || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleZoomOut}><ZoomOut className="h-4 w-4"/></Button>
            <span>{zoomLevel}%</span>
            <Slider
                value={[zoomLevel]}
                max={200}
                min={50}
                step={10}
                className="w-24"
                onValueChange={(value) => setZoomLevel(value[0])}
            />
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleZoomIn}><ZoomIn className="h-4 w-4"/></Button>
        </div>
      </div>
    </div>
  );
};
