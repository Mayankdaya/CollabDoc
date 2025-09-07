
"use client";

import { useState, useTransition } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generateContentSuggestions } from '@/app/documents/[id]/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface AiSuggestionsPopoverProps {
  documentContent: string;
}

export default function AiSuggestionsPopover({ documentContent }: AiSuggestionsPopoverProps) {
  const [tone, setTone] = useState('professional');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateSuggestions = () => {
    startTransition(async () => {
      try {
        const result = await generateContentSuggestions({
          documentContent,
          cursorPosition: 0, // Note: Cursor position is not easily available here.
          tone,
        });
        
        if (result.suggestions && result.suggestions.length > 0) {
            setSuggestions(result.suggestions);
        } else {
            setSuggestions(['No suggestions found for this context.']);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error generating suggestions',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
        setSuggestions([]);
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="sr-only">AI Suggestions</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline">AI Content Suggestions</h4>
            <p className="text-sm text-muted-foreground">
              Improve your writing with AI-powered suggestions.
            </p>
          </div>
          <div className="grid gap-2">
            <div className='space-y-2'>
              <Label htmlFor="tone-select">Select a tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone-select" className="w-full">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateSuggestions} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Suggestions
            </Button>
          </div>
          {suggestions.length > 0 && (
            <div className="grid gap-2">
                <h5 className="font-medium text-sm">Suggestions</h5>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
