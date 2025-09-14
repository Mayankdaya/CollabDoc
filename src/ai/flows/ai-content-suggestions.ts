
'use server';

/**
 * @fileOverview Provides AI-powered content suggestions and direct content generation.
 *
 * - generateContentSuggestions - Generates writing improvement suggestions.
 * - findSynonyms - Finds synonyms for a word.
 * - checkSpellingAndGrammar - Checks for spelling and grammar errors.
 * - generateDocumentFromTopic - Generates a full HTML document from a topic.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

// Section 1: Content Improvement Suggestions

const GenerateContentSuggestionsInputSchema = z.object({
  documentContent: z.string().describe('The current content of the document.'),
  cursorPosition: z.number().describe('The cursor position for context.'),
  tone: z.string().optional().describe('Desired tone for the suggestions.'),
});
export type GenerateContentSuggestionsInput = z.infer<typeof GenerateContentSuggestionsInputSchema>;

const GenerateContentSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Array of content suggestions.'),
});
export type GenerateContentSuggestionsOutput = z.infer<typeof GenerateContentSuggestionsOutputSchema>;

export async function generateContentSuggestions(input: GenerateContentSuggestionsInput): Promise<GenerateContentSuggestionsOutput> {
  return generateContentSuggestionsFlow(input);
}

const generateContentSuggestionsPrompt = ai.definePrompt({
  name: 'generateContentSuggestionsPrompt',
  input: {schema: GenerateContentSuggestionsInputSchema},
  output: {schema: GenerateContentSuggestionsOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `Generate content improvement suggestions based on the document content, cursor position, and desired tone.
  Document: {{documentContent}}
  Cursor at: {{cursorPosition}}
  Tone: {{tone}}`,
});

const generateContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateContentSuggestionsFlow',
    inputSchema: GenerateContentSuggestionsInputSchema,
    outputSchema: GenerateContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await generateContentSuggestionsPrompt(input);
    return output!;
  }
);

// Section 2: Writing Assistance Tools

const FindSynonymsInputSchema = z.object({
  word: z.string().describe('The word to find synonyms for.'),
});

const FindSynonymsOutputSchema = z.object({
    synonyms: z.array(z.string()).describe('Array of synonyms.'),
});

export async function findSynonyms(word: string): Promise<z.infer<typeof FindSynonymsOutputSchema>> {
    return findSynonymsFlow({ word });
}

const findSynonymsPrompt = ai.definePrompt({
    name: 'findSynonymsPrompt',
    input: { schema: FindSynonymsInputSchema },
    output: { schema: FindSynonymsOutputSchema },
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: 'Find synonyms for the word: {{word}}',
});

const findSynonymsFlow = ai.defineFlow(
    {
        name: 'findSynonymsFlow',
        inputSchema: FindSynonymsInputSchema,
        outputSchema: FindSynonymsOutputSchema,
    },
    async (input) => {
        const { output } = await findSynonymsPrompt(input);
        return output!;
    }
);

const SpellingAndGrammarInputSchema = z.object({
  documentContent: z.string().describe('The document content to check.'),
});

const SpellingAndGrammarOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Array of spelling/grammar suggestions.'),
});

export async function checkSpellingAndGrammar(documentContent: string): Promise<z.infer<typeof SpellingAndGrammarOutputSchema>> {
  return checkSpellingAndGrammarFlow({ documentContent });
}

const checkSpellingAndGrammarPrompt = ai.definePrompt({
  name: 'checkSpellingAndGrammarPrompt',
  input: { schema: SpellingAndGrammarInputSchema },
  output: { schema: SpellingAndGrammarOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: 'Check for spelling and grammar errors and provide suggestions. Document: {{documentContent}}',
});

const checkSpellingAndGrammarFlow = ai.defineFlow(
    {
        name: 'checkSpellingAndGrammarFlow',
        inputSchema: SpellingAndGrammarInputSchema,
        outputSchema: SpellingAndGrammarOutputSchema,
    },
    async (input) => {
        const { output } = await checkSpellingAndGrammarPrompt(input);
        return output!;
    }
);

// Section 3: Direct Document Generation

const GenerateDocumentFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic for the new document.'),
});
export type GenerateDocumentFromTopicInput = z.infer<typeof GenerateDocumentFromTopicInputSchema>;

const GenerateDocumentFromTopicOutputSchema = z.object({
  documentContent: z.string().describe('The generated HTML content for the document.'),
});
export type GenerateDocumentFromTopicOutput = z.infer<typeof GenerateDocumentFromTopicOutputSchema>;


export async function generateDocumentFromTopic(input: GenerateDocumentFromTopicInput): Promise<GenerateDocumentFromTopicOutput> {
  return generateDocumentFromTopicFlow(input);
}

const generateDocumentFromTopicPrompt = ai.definePrompt({
  name: 'generateDocumentFromTopicPrompt',
  input: {schema: GenerateDocumentFromTopicInputSchema},
  output: {schema: GenerateDocumentFromTopicOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that generates well-structured HTML documents.
  Based on the topic "{{topic}}", create a comprehensive document.
  The output MUST be valid HTML content, including headings, paragraphs, and lists where appropriate.`,
});

const generateDocumentFromTopicFlow = ai.defineFlow(
  {
    name: 'generateDocumentFromTopicFlow',
    inputSchema: GenerateDocumentFromTopicInputSchema,
    outputSchema: GenerateDocumentFromTopicOutputSchema,
  },
  async input => {
    const {output} = await generateDocumentFromTopicPrompt(input);
    return output!;
  }
);

    