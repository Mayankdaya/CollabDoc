
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EditorContent, useEditor, BubbleMenu, FloatingMenu } from '@tiptap/react';
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
import { FontSize } from './extensions/font-size';
import { LineHeight } from './extensions/line-height';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Save,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Settings,
  Type,
  Palette,
  AlignHorizontalJustifyCenter,
  Strikethrough,
  Superscript,
  Subscript,
  Minus,
  Hash,
  CheckSquare,
  Square,
  MoreHorizontal,
  FileText,
  BarChart3,
  Users,
  Clock,
  Eye,
  EyeOff,
  Search,
  Replace,
  BookOpen,
  Layers,
  Zap,
  Target,
  Sparkles,
  X,
  Home,
  Insert,
  PageLayout,
  References,
  Mailings,
  Review,
  View,
  HelpCircle,
  Menu,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  FolderOpen,
  Share,
  Copy,
  Cut,
  Paste,
  Scissors,
  Clipboard,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Square as SquareIcon,
  Circle,
  Triangle,
  Star,
  Heart,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Calendar,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Battery as BatteryIcon,
  BatteryLow as BatteryLowIcon,
  Signal as SignalIcon,
  SignalHigh as SignalHighIcon,
  SignalLow as SignalLowIcon,
  SignalZero as SignalZeroIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Globe as GlobeIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp as ThumbsUpIcon,
  Meh as MehIcon,
  Frown as FrownIcon,
  Smile as SmileIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Triangle as TriangleIcon,
  Circle as CircleIcon,
  Square as SquareIcon2,
  Minimize2 as Minimize2Icon,
  Maximize2 as Maximize2Icon,
  RotateCw as RotateCwIcon,
  RotateCcw as RotateCcwIcon,
  Clipboard as ClipboardIcon,
  Scissors as ScissorsIcon,
  Paste as PasteIcon,
  Cut as CutIcon,
  Copy as CopyIcon,
  Share as ShareIcon,
  FolderOpen as FolderOpenIcon,
  File as FileIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  MoreVertical as MoreVerticalIcon,
  Menu as MenuIcon,
  HelpCircle as HelpCircleIcon,
  View as ViewIcon,
  Review as ReviewIcon,
  Mailings as MailingsIcon,
  PageLayout as PageLayoutIcon,
  Insert as InsertIcon,
  Home as HomeIcon
} from 'lucide-react';

interface MicrosoftWordEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export const MicrosoftWordEditor: React.FC<MicrosoftWordEditorProps> = ({
  content: initialContent = '',
  onContentChange,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState('11');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showGridlines, setShowGridlines] = useState(false);
  const [viewMode, setViewMode] = useState<'print' | 'web' | 'read'>('print');

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: isClient ? [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'word-heading',
            style: 'color: #000000;',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'word-paragraph',
            style: 'color: #000000;',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'word-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'word-ordered-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'word-list-item',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'word-blockquote',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'word-code-block',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'word-code',
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'word-horizontal-rule',
          },
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
        HTMLAttributes: {
          class: 'word-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'word-table-row',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'word-table-cell',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'word-table-header',
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'word-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'word-link',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document here...',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      History,
      Gapcursor,
      Dropcursor,
    ] : [StarterKit],
    content: content || '<p>Start typing your document here...</p>',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      onContentChange?.(newContent);
    },
    editorProps: {
      attributes: {
        class: 'word-editor',
        'data-placeholder': 'Start typing your document here...',
        style: 'color: #000000; background-color: white;',
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Font family change
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    if (editor) {
      editor.commands.setFontFamily(font);
    }
  };

  // Font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    if (editor) {
      editor.commands.setFontSize(size + 'pt');
    }
  };

  // Text color change
  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    if (editor) {
      editor.commands.setColor(color);
    }
  };

  // Highlight color change
  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    if (editor) {
      editor.commands.setHighlight({ color });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Save function
  const handleSave = () => {
    if (onSave && editor) {
      onSave(editor.getHTML());
    }
  };

  // Search and replace
  const handleSearch = () => {
    if (editor && searchQuery) {
      const text = editor.getText();
      const regex = new RegExp(searchQuery, 'gi');
      const matches = text.match(regex);
      if (matches) {
        alert(`Found ${matches.length} matches for "${searchQuery}"`);
      } else {
        alert(`No matches found for "${searchQuery}"`);
      }
    }
  };

  const handleReplace = () => {
    if (editor && searchQuery && replaceQuery) {
      const text = editor.getText();
      const newText = text.replace(new RegExp(searchQuery, 'gi'), replaceQuery);
      editor.commands.setContent(newText);
      alert(`Replaced all instances of "${searchQuery}" with "${replaceQuery}"`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (editor) {
              editor.commands.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            if (editor) {
              editor.commands.redo();
            }
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
          case 'h':
            e.preventDefault();
            setShowSearch(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, content]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading Microsoft Word Editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Microsoft Word Title Bar */}
      <div className="bg-white border-b border-gray-300 h-8 flex items-center justify-between px-4 text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Document1 - Microsoft Word</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Minimize2Icon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Maximize2Icon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Microsoft Word Menu Bar */}
      <div className="bg-white border-b border-gray-300 h-8 flex items-center px-4 text-sm">
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <FileIcon className="h-3 w-3 mr-1" />
            File
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <HomeIcon className="h-3 w-3 mr-1" />
            Home
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <InsertIcon className="h-3 w-3 mr-1" />
            Insert
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <PageLayoutIcon className="h-3 w-3 mr-1" />
            Page Layout
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <References className="h-3 w-3 mr-1" />
            References
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <MailingsIcon className="h-3 w-3 mr-1" />
            Mailings
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <ReviewIcon className="h-3 w-3 mr-1" />
            Review
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <ViewIcon className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <HelpCircleIcon className="h-3 w-3 mr-1" />
            Help
          </Button>
        </div>
      </div>

      {/* Microsoft Word Ribbon */}
      <div className="bg-white border-b border-gray-300">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-10 bg-gray-50 rounded-none border-b">
            <TabsTrigger value="home" className="flex items-center space-x-1 px-4">
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </TabsTrigger>
            <TabsTrigger value="insert" className="flex items-center space-x-1 px-4">
              <InsertIcon className="h-4 w-4" />
              <span>Insert</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center space-x-1 px-4">
              <Palette className="h-4 w-4" />
              <span>Design</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center space-x-1 px-4">
              <PageLayoutIcon className="h-4 w-4" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="references" className="flex items-center space-x-1 px-4">
              <BookOpen className="h-4 w-4" />
              <span>References</span>
            </TabsTrigger>
            <TabsTrigger value="mailings" className="flex items-center space-x-1 px-4">
              <MailIcon className="h-4 w-4" />
              <span>Mailings</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center space-x-1 px-4">
              <ReviewIcon className="h-4 w-4" />
              <span>Review</span>
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center space-x-1 px-4">
              <ViewIcon className="h-4 w-4" />
              <span>View</span>
            </TabsTrigger>
          </TabsList>

          {/* Home Tab Content */}
          <TabsContent value="home" className="p-4 space-y-4">
            {/* Clipboard Group */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Clipboard</h4>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <PasteIcon className="h-4 w-4 mr-1" />
                  Paste
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <CutIcon className="h-4 w-4 mr-1" />
                  Cut
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <CopyIcon className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <RotateCcwIcon className="h-4 w-4 mr-1" />
                  Format Painter
                </Button>
              </div>
            </div>

            {/* Font Group */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Font</h4>
              <div className="flex items-center space-x-2">
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calibri">Calibri</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={fontSize} onValueChange={handleFontSizeChange}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={editor?.isActive('bold') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleBold()}
                  className="h-8 w-8 p-0"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('italic') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleItalic()}
                  className="h-8 w-8 p-0"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('underline') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleUnderline()}
                  className="h-8 w-8 p-0"
                  title="Underline (Ctrl+U)"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('strike') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleStrike()}
                  className="h-8 w-8 p-0"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.commands.toggleSuperscript()}
                  className="h-8 w-8 p-0"
                  title="Superscript"
                >
                  <Superscript className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.commands.toggleSubscript()}
                  className="h-8 w-8 p-0"
                  title="Subscript"
                >
                  <Subscript className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Paragraph Group */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Paragraph</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleBulletList()}
                  className="h-8 w-8 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.toggleOrderedList()}
                  className="h-8 w-8 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.setTextAlign('left')}
                  className="h-8 w-8 p-0"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.setTextAlign('center')}
                  className="h-8 w-8 p-0"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.setTextAlign('right')}
                  className="h-8 w-8 p-0"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor?.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editor?.commands.setTextAlign('justify')}
                  className="h-8 w-8 p-0"
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Styles Group */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Styles</h4>
              <div className="flex items-center space-x-1">
                <Select>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="heading1">Heading 1</SelectItem>
                    <SelectItem value="heading2">Heading 2</SelectItem>
                    <SelectItem value="heading3">Heading 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Insert Tab Content */}
          <TabsContent value="insert" className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Pages</h4>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <FileText className="h-4 w-4 mr-1" />
                  Cover Page
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <Minus className="h-4 w-4 mr-1" />
                  Blank Page
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <Hash className="h-4 w-4 mr-1" />
                  Page Break
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Tables</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })}
                  className="h-8 px-3"
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Illustrations</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                      editor?.commands.setImage({ src: url });
                    }
                  }}
                  className="h-8 px-3"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Pictures
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Shapes
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <Square className="h-4 w-4 mr-1" />
                  Icons
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase">Links</h4>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                      editor?.commands.setLink({ href: url });
                    }
                  }}
                  className="h-8 px-3"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  Bookmark
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs content would go here... */}
        </Tabs>
      </div>

      {/* Rulers */}
      {showRulers && (
        <div className="bg-white border-b border-gray-300 h-6 flex items-center px-4">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">0</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">1</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">2</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">3</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">4</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">5</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">6</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">7</div>
            <div className="w-8 h-4 bg-gray-200 rounded flex items-center justify-center">8</div>
          </div>
        </div>
      )}

      {/* Document Area */}
      <div className="flex-1 overflow-auto bg-gray-200">
        <div 
          className="w-full h-full p-8"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            minHeight: `${100 / (zoomLevel / 100)}%`
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg min-h-[600px] p-8 rounded-lg">
              {editor ? (
                <>
                  {/* Bubble Menu for selected text */}
                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center space-x-1"
                  >
                    <Button
                      variant={editor.isActive('bold') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor.isActive('italic') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor.isActive('underline') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor.isActive('highlight') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHighlight().run()}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </BubbleMenu>

                  <EditorContent
                    editor={editor}
                    className="word-editor-content"
                    style={{
                      minHeight: '500px',
                      outline: 'none',
                    }}
                  />
                </>
              ) : (
                <div className="min-h-[500px] p-4 text-gray-500">
                  Loading Microsoft Word Editor...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-300 h-6 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Page 1 of 1</span>
          <span>Words: {editor?.getText().split(/\s+/).filter(word => word.length > 0).length || 0}</span>
          <span>Characters: {editor?.getText().length || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <ZoomOut className="h-3 w-3 mr-1" />
            {zoomLevel}%
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <ZoomIn className="h-3 w-3 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
