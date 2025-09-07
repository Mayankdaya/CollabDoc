
'use server';

/**
 * @fileOverview Provides AI-powered content suggestions for improving writing within the collaborative document editor.
 *
 * - generateContentSuggestions - A function that generates content suggestions.
 * - GenerateContentSuggestionsInput - The input type for the generateContentSuggestions function.
 * - GenerateContentSuggestionsOutput - The return type for the generateContentSuggestions function.
 * - findSynonyms - A function that finds synonyms for a given word.
 * - checkSpellingAndGrammar - A function that checks the document for spelling and grammar errors.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentSuggestionsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The current content of the document being edited.'),
  cursorPosition: z
    .number()
    .describe(
      'The current cursor position within the document content, used to provide context-aware suggestions.'
    ),
  tone: z
    .string()
    .optional()
    .describe(
      'The desired tone of the content, e.g., professional, casual, academic.'
    ),
});
export type GenerateContentSuggestionsInput = z.infer<
  typeof GenerateContentSuggestionsInputSchema
>;

const GenerateContentSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of suggested phrases, sentences, or paragraphs to improve the document content.'
    ),
});
export type GenerateContentSuggestionsOutput = z.infer<
  typeof GenerateContentSuggestionsOutputSchema
>;

export async function generateContentSuggestions(
  input: GenerateContentSuggestionsInput
): Promise<GenerateContentSuggestionsOutput> {
  return generateContentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentSuggestionsPrompt',
  input: {schema: GenerateContentSuggestionsInputSchema},
  output: {schema: GenerateContentSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide content suggestions for a collaborative document editor.
  Given the current document content, cursor position, and desired tone, generate an array of suggested phrases, sentences, or paragraphs to improve the writing.

  Current Document Content:
  {{documentContent}}

  Cursor Position: {{cursorPosition}}

  Desired Tone: {{tone}}

  Suggestions:
  `,
});

const generateContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateContentSuggestionsFlow',
    inputSchema: GenerateContentSuggestionsInputSchema,
    outputSchema: GenerateContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


const FindSynonymsInputSchema = z.object({
  word: z.string().describe('The word to find synonyms for.'),
});

const FindSynonymsOutputSchema = z.object({
    synonyms: z.array(z.string()).describe('An array of synonyms for the given word.'),
});

export async function findSynonyms(word: string): Promise<z.infer<typeof FindSynonymsOutputSchema>> {
    return findSynonymsFlow({ word });
}

const findSynonymsPrompt = ai.definePrompt({
    name: 'findSynonymsPrompt',
    input: { schema: FindSynonymsInputSchema },
    output: { schema: FindSynonymsOutputSchema },
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
  documentContent: z.string().describe('The content of the document to check.'),
});

const SpellingAndGrammarOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of spelling and grammar suggestions.'),
});

export async function checkSpellingAndGrammar(
  documentContent: string
): Promise<z.infer<typeof SpellingAndGrammarOutputSchema>> {
  return checkSpellingAndGrammarFlow({ documentContent });
}

const checkSpellingAndGrammarPrompt = ai.definePrompt({
  name: 'checkSpellingAndGrammarPrompt',
  input: { schema: SpellingAndGrammarInputSchema },
  output: { schema: SpellingAndGrammarOutputSchema },
  prompt: 'Check the following document for spelling and grammar errors. Provide a list of suggestions for improvement. Document: {{documentContent}}',
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
