
"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Highlighter,
  Paintbrush,
  Save,
  Printer,
  Share2,
  FileDown,
  History,
  Shield,
  Info,
  Settings,
  UserCircle,
  FilePlus,
  FolderOpen,
  Split,
  Merge,
  Trash2,
  Columns,
  Rows,
  FlipVertical,
  FlipHorizontal,
  Eraser,
  MinusSquare,
  PlusSquare,
  Book,
  Newspaper,
  RectangleHorizontal,
  MoveHorizontal,
  SpellCheck,
  BookText,
  Calculator,
  MessageSquarePlus,
  MessageSquare,
  Replace,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Ruler,
  Grid,
  Navigation,
  LifeBuoy,
  MessageCircleQuestion,
  BookUser,
  Loader2,
  ScanText,
  Languages,
  Code,
  Quote,
  Link as LinkIcon,
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '../ui/separator';
import { Toggle } from '../ui/toggle';
import type { Editor } from '@tiptap/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useCallback, useState, useTransition } from 'react';
import { ShareDialog } from './share-dialog';
import { translateDocument, summarizeDocument, generateTableOfContents, insertCitation, generateBibliography } from '@/app/documents/[id]/actions';
import { saveDocumentAs, Document } from '@/app/documents/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { FolderSymlink } from 'lucide-react';
import { OpenDocumentDialog } from './open-document-dialog';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/use-auth';
import { NewDocumentDialog } from '../dashboard/new-document-dialog';

interface EditorToolbarProps {
    editor: Editor | null;
    wordCount: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    docName: string;
    doc: Document;
}


export function EditorToolbar({ editor, wordCount, onZoomIn, onZoomOut, docName, doc }: EditorToolbarProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaveAsPending, startSaveAsTransition] = useTransition();
    const [isTranslatePending, startTranslateTransition] = useTransition();
    const [translateLanguage, setTranslateLanguage] = useState('Spanish');
    const [summary, setSummary] = useState('');
    const [isSummaryPending, startSummaryTransition] = useTransition();
    const [summaryOpen, setSummaryOpen] = useState(false);

    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [isTablePopoverOpen, setTablePopoverOpen] = useState(false);

    const [isTocPending, startTocTransition] = useTransition();
    const [isCitationPending, startCitationTransition] = useTransition();
    const [isBibPending, startBibTransition] = useTransition();

    const [citationDetails, setCitationDetails] = useState('');
    const [citationStyle, setCitationStyle] = useState('APA');


    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
      if (!editor) return;
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      // update link
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleInsertTable = () => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
            setTablePopoverOpen(false);
        }
    };

    const handleSaveAs = () => {
        if (!editor || !user) return;
        startSaveAsTransition(async () => {
            try {
                await saveDocumentAs({
                    name: docName, 
                    content: editor.getHTML(),
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous'
                });
                toast({
                    title: 'Document Saved As',
                    description: 'A new copy of your document has been created.',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error Saving As',
                    description: 'Could not create a copy of the document.',
                });
            }
        });
    };

    const handlePrint = () => {
      const printContent = editor?.getHTML();
      if (printContent) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow?.document.write('<html><head><title>Print</title>');
        // You might want to include your app's CSS here for consistent styling
        printWindow?.document.write('<style>body { font-family: sans-serif; } .prose { max-width: none; color: black; } </style>');
        printWindow?.document.write('</head><body >');
        printWindow?.document.write('<div class="prose">');
        printWindow?.document.write(printContent);
        printWindow?.document.write('</div>');
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.focus();
        printWindow?.print();
      }
    };

    const handleTranslate = () => {
        if (!editor) return;
        const documentContent = editor.getHTML();
        startTranslateTransition(async () => {
            try {
                const result = await translateDocument({ documentContent, targetLanguage: translateLanguage });
                editor.commands.setContent(result.translatedContent);
                toast({
                    title: "Translation successful",
                    description: `Document translated to ${translateLanguage}.`
                });
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Translation Error",
                    description: "Could not translate document.",
                });
            }
        });
    };

    const handleSummarize = () => {
        if (!editor) return;
        const documentContent = editor.getHTML();
        setSummaryOpen(true);
        startSummaryTransition(async () => {
            try {
                const result = await summarizeDocument({ documentContent });
                setSummary(result.summary);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Summarization Error",
                    description: "Could not summarize document.",
                });
                setSummary('');
            }
        });
    };

    const handleGenerateToc = () => {
        if (!editor) return;
        startTocTransition(async () => {
            try {
                const result = await generateTableOfContents({ documentContent: editor.getHTML() });
                editor.chain().focus().insertContentAt(0, result.toc).run();
                toast({ title: 'Table of Contents inserted.' });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not generate Table of Contents." });
            }
        });
    }

    const handleInsertCitation = () => {
        if (!editor || !citationDetails) return;
        startCitationTransition(async () => {
            try {
                const result = await insertCitation({ 
                    documentContent: editor.getHTML(), 
                    citationDetails, 
                    citationStyle 
                });
                editor.commands.setContent(result.updatedDocumentContent);
                toast({ title: 'Citation inserted.' });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not insert citation." });
            }
        });
    }

    const handleGenerateBibliography = () => {
        if (!editor) return;
        startBibTransition(async () => {
            try {
                const result = await generateBibliography({ 
                    documentContent: editor.getHTML(), 
                    citationStyle 
                });
                editor.chain().focus().insertContent(result.bibliography).run();
                toast({ title: 'Bibliography generated.' });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not generate bibliography." });
            }
        });
    }


    if (!editor) {
        return null;
    }

  return (
    <div className='border-b bg-background overflow-x-auto'>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className={cn('px-4 justify-start rounded-none border-b bg-transparent w-min')}>
          <TabsTrigger value="file">File</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        <TabsContent value="file" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <NewDocumentDialog>
                    <Button variant="ghost" size="sm"><FilePlus className="mr-2 h-4 w-4" /> New</Button>
                </NewDocumentDialog>
                <OpenDocumentDialog>
                    <Button variant="ghost" size="sm"><FolderOpen className="mr-2 h-4 w-4" /> Open</Button>
                </OpenDocumentDialog>
                <Button variant="ghost" size="sm" onClick={handleSaveAs} disabled={isSaveAsPending}>
                    {isSaveAsPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderSymlink className="mr-2 h-4 w-4" />}
                     Save As
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                <ShareDialog doc={doc}>
                  <Button variant="ghost" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                </ShareDialog>
                <Button variant="ghost" size="sm" disabled><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><Shield className="mr-2 h-4 w-4" /> Protect</Button>
                <Popover open={summaryOpen} onOpenChange={setSummaryOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleSummarize}><ScanText className="mr-2 h-4 w-4" /> Summarize</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                         <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Document Summary</h4>
                            {isSummaryPending ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <p className="text-sm">{summary}</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" disabled><History className="mr-2 h-4 w-4" /> Versions</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><UserCircle className="mr-2 h-4 w-4" /> Account</Button>
                <Button variant="ghost" size="sm" disabled><Settings className="mr-2 h-4 w-4" /> Options</Button>
            </div>
        </TabsContent>
        <TabsContent value="home" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Select
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'heading 1' :
                        editor.isActive('heading', { level: 2 }) ? 'heading 2' :
                        editor.isActive('heading', { level: 3 }) ? 'heading 3' :
                        'paragraph'
                    }
                    onValueChange={(value) => {
                        const chain = editor.chain().focus();
                        if (value === 'paragraph') {
                            chain.setParagraph().run();
                        } else if (value.startsWith('heading')) {
                            const level = parseInt(value.split(' ')[1]) as 1 | 2 | 3;
                            chain.toggleHeading({ level }).run();
                        }
                    }}>
                    <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
                    <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="heading 1">Heading 1</SelectItem>
                        <SelectItem value="heading 2">Heading 2</SelectItem>
                        <SelectItem value="heading 3">Heading 3</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue='Calibri' onValueChange={value => editor.chain().focus().setFontFamily(value).run()}>
                    <SelectTrigger className='w-[100px] sm:w-[140px] text-xs sm:text-sm'>
                        <SelectValue placeholder="Font Family" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Calibri'>Calibri</SelectItem>
                        <SelectItem value='Arial'>Arial</SelectItem>
                        <SelectItem value='Georgia'>Georgia</SelectItem>
                        <SelectItem value='serif'>Serif</SelectItem>
                        <SelectItem value='monospace'>Monospace</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue='12pt' onValueChange={value => editor.chain().focus().setFontSize(value).run()}>
                    <SelectTrigger className='w-[70px] sm:w-[80px] text-xs sm:text-sm'>
                        <SelectValue placeholder="Font Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map(size => (
                            <SelectItem key={size} value={`${size}pt`}>{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className='flex items-center'>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().incrementFontSize().run()}><PlusSquare className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().decrementFontSize().run()}><MinusSquare className="h-4 w-4" /></Button>
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().unsetFontSize().unsetColor().unsetHighlight().unsetBold().unsetItalic().unsetUnderline().unsetStrike().run()}><Eraser className="h-4 w-4" /></Button>
                
                <Separator orientation="vertical" className="h-8" />

                <ToggleGroup 
                    type="multiple" 
                    aria-label="Text formatting"
                    value={
                        ["bold", "italic", "underline", "strike"].filter(mark => editor.isActive(mark))
                    }
                    onValueChange={(value) => {
                        // This is a workaround to apply styles correctly.
                        const chain = editor.chain().focus();
                        const activeMarks = {
                            bold: editor.isActive('bold'),
                            italic: editor.isActive('italic'),
                            underline: editor.isActive('underline'),
                            strike: editor.isActive('strike'),
                        };
                        if (value.includes('bold') !== activeMarks.bold) chain.toggleBold();
                        if (value.includes('italic') !== activeMarks.italic) chain.toggleItalic();
                        if (value.includes('underline') !== activeMarks.underline) chain.toggleUnderline();
                        if (value.includes('strike') !== activeMarks.strike) chain.toggleStrike();
                        chain.run();
                    }}
                >
                    <ToggleGroupItem value="bold" aria-label="Toggle bold" className="h-9 w-9">
                        <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic" className="h-9 w-9">
                        <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline" className="h-9 w-9">
                        <Underline className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="strike" aria-label="Toggle strikethrough" className="h-9 w-9">
                        <Strikethrough className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <label className='cursor-pointer'>
                            <Paintbrush className="h-4 w-4" />
                            <input type="color" className="sr-only" onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || ''} />
                        </label>
                    </Button>
                     <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                        <label className='cursor-pointer'>
                            <Highlighter className="h-4 w-4" />
                            <input type="color" className="sr-only" onInput={(event) => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()} value={editor.getAttributes('highlight').color || ''} />
                        </label>
                    </Button>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <ToggleGroup 
                    type="single" 
                    aria-label="Text alignment"
                    value={
                        editor.isActive({ textAlign: 'center' }) ? 'center' :
                        editor.isActive({ textAlign: 'right' }) ? 'right' :
                        editor.isActive({ textAlign: 'justify' }) ? 'justify' :
                        'left'
                    }
                    onValueChange={(value) => {
                        editor.chain().focus().setTextAlign(value || 'left').run()
                    }}
                >
                    <ToggleGroupItem value="left" aria-label="Left aligned" className="h-9 w-9">
                        <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Center aligned" className="h-9 w-9">
                        <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Right aligned" className="h-9 w-9">
                        <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justify" aria-label="Justify aligned" className="h-9 w-9">
                        <AlignJustify className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
                <Separator orientation="vertical" className="h-8" />
                <Toggle 
                    aria-label="Toggle bullet list" 
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    className="h-9 w-9"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle 
                    aria-label="Toggle numbered list" 
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    className="h-9 w-9"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="h-8" />
                <Toggle 
                    aria-label="Toggle blockquote" 
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    className="h-9 w-9"
                >
                    <Quote className="h-4 w-4" />
                </Toggle>
                <Toggle 
                    aria-label="Toggle code block" 
                    pressed={editor.isActive('codeBlock')}
                    onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                    className="h-9 w-9"
                >
                    <Code className="h-4 w-4" />
                </Toggle>
            </div>
        </TabsContent>
        <TabsContent value="insert" className='p-2 m-0 bg-muted/40'>
            <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Picture
                </Button>
                <Button variant="ghost" size="sm" onClick={setLink} disabled={!editor.isEditable}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                </Button>
                 <Popover open={isTablePopoverOpen} onOpenChange={setTablePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <TableIcon className="h-4 w-4 mr-2" />
                            Table
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Insert Table</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rows">Rows</Label>
                                    <Input
                                        id="rows"
                                        type="number"
                                        value={tableRows}
                                        onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 0)}
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cols">Columns</Label>
                                    <Input
                                        id="cols"
                                        type="number"
                                        value={tableCols}
                                        onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 0)}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleInsertTable}>Insert Table</Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="h-4 w-4 mr-2" />
                    Horizontal Rule
                </Button>
                {editor.can().deleteTable() && <>
                    <Separator orientation="vertical" className="h-8" />
                    <div className='text-sm text-muted-foreground ml-2 mr-1 hidden lg:block'>Table</div>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <Columns className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <Columns className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <Rows className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <Rows className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().deleteRow().run()}>
                         <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().deleteTable().run()}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().mergeCells().run()}>
                        <Merge className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().splitCell().run()}>
                        <Split className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
                        <FlipHorizontal className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                        <FlipVertical className="h-4 w-4" />
                    </Button>
                </>}
            </div>
        </TabsContent>
        <TabsContent value="layout" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" disabled><MoveHorizontal className="mr-2 h-4 w-4" /> Margins</Button>
                <Button variant="ghost" size="sm" disabled><RectangleHorizontal className="mr-2 h-4 w-4" /> Orientation</Button>
                <Button variant="ghost" size="sm" disabled><Newspaper className="mr-2 h-4 w-4" /> Size</Button>
                <Button variant="ghost" size="sm" disabled><Columns className="mr-2 h-4 w-4" /> Columns</Button>
            </div>
        </TabsContent>
        <TabsContent value="references" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" onClick={handleGenerateToc} disabled={isTocPending}>
                    {isTocPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Book className="mr-2 h-4 w-4" />}
                     Table of Contents
                </Button>
                <Button variant="ghost" size="sm" disabled><PlusSquare className="mr-2 h-4 w-4" /> Add Text</Button>
                <Button variant="ghost" size="sm" disabled><Newspaper className="mr-2 h-4 w-4" /> Update Table</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><FilePlus className="mr-2 h-4 w-4" /> Insert Footnote</Button>
                <Button variant="ghost" size="sm" disabled><FilePlus className="mr-2 h-4 w-4" /> Insert Endnote</Button>
                <Button variant="ghost" size="sm" disabled><MoveHorizontal className="mr-2 h-4 w-4" /> Next Footnote</Button>
                <Button variant="ghost" size="sm" disabled><BookOpen className="mr-2 h-4 w-4" /> Show Notes</Button>
                <Separator orientation="vertical" className="h-8" />
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm"><MessageSquarePlus className="mr-2 h-4 w-4" /> Insert Citation</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96">
                        <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Insert Citation</h4>
                            <div className="space-y-2">
                                <Label htmlFor="citation-details">Citation (e.g., "Smith, 2021")</Label>
                                <Input id="citation-details" value={citationDetails} onChange={(e) => setCitationDetails(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="citation-style">Style</Label>
                                <Select value={citationStyle} onValueChange={setCitationStyle}>
                                    <SelectTrigger id="citation-style">
                                        <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APA">APA</SelectItem>
                                        <SelectItem value="MLA">MLA</SelectItem>
                                        <SelectItem value="Chicago">Chicago</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleInsertCitation} disabled={isCitationPending}>
                                {isCitationPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
                                Insert
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="sm" disabled><BookUser className="mr-2 h-4 w-4" /> Manage Sources</Button>
                <Button variant="ghost" size="sm" onClick={handleGenerateBibliography} disabled={isBibPending}>
                   {isBibPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Book className="mr-2 h-4 w-4" />}
                    Bibliography
                </Button>
            </div>
        </TabsContent>
        <TabsContent value="review" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" disabled><SpellCheck className="mr-2 h-4 w-4" /> Spelling & Grammar</Button>
                <Button variant="ghost" size="sm" disabled><BookText className="mr-2 h-4 w-4" /> Thesaurus</Button>
                <div className="flex items-center gap-2 text-sm px-2">
                    <Calculator className="h-4 w-4" />
                    <span>{wordCount} Words</span>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm"><Languages className="mr-2 h-4 w-4" /> Translate</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                         <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Translate Document</h4>
                             <div className='space-y-2'>
                                <Label htmlFor="language-select">Select Language</Label>
                                <Select value={translateLanguage} onValueChange={setTranslateLanguage}>
                                    <SelectTrigger id="language-select" className="w-full">
                                    <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="German">German</SelectItem>
                                    <SelectItem value="Japanese">Japanese</SelectItem>
                                    <SelectItem value="Mandarin">Mandarin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleTranslate} disabled={isTranslatePending}>
                                {isTranslatePending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Languages className="mr-2 h-4 w-4" />
                                )}
                                Translate
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><MessageSquarePlus className="mr-2 h-4 w-4" /> New Comment</Button>
                <Button variant="ghost" size="sm" disabled><MessageSquare className="mr-2 h-4 w-4" /> Show Comments</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><Replace className="mr-2 h-4 w-4" /> Track Changes</Button>
            </div>
        </TabsContent>
        <TabsContent value="view" className='p-2 m-0 bg-muted/40'>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" disabled><BookOpen className="mr-2 h-4 w-4" /> Read Mode</Button>
                <Button variant="ghost" size="sm" disabled><Printer className="mr-2 h-4 w-4" /> Print Layout</Button>
                <Button variant="ghost" size="sm" disabled><Newspaper className="mr-2 h-4 w-4" /> Web Layout</Button>                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><Ruler className="mr-2 h-4 w-4" /> Ruler</Button>
                <Button variant="ghost" size="sm" disabled><Grid className="mr-2 h-4 w-4" /> Gridlines</Button>
                <Button variant="ghost" size="sm" disabled><Navigation className="mr-2 h-4 w-4" /> Navigation Pane</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" onClick={onZoomIn}><ZoomIn className="mr-2 h-4 w-4" /> Zoom In</Button>
                <Button variant="ghost" size="sm" onClick={onZoomOut}><ZoomOut className="mr-2 h-4 w-4" /> Zoom Out</Button>
            </div>
        </TabsContent>
        <TabsContent value="help" className='p-2 m-0 bg-muted/40'>
             <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" disabled><LifeBuoy className="mr-2 h-4 w-4" /> Help</Button>
                <Button variant="ghost" size="sm" disabled><MessageCircleQuestion className="mr-2 h-4 w-4" /> Contact Support</Button>
                <Button variant="ghost" size="sm" disabled><BookUser className="mr-2 h-4 w-4" /> Feedback</Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" disabled><Info className="mr-2 h-4 w-4" /> About</Button>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
