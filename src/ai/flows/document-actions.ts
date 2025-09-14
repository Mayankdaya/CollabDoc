
'use server';
/**
 * @fileOverview Provides AI-powered actions for the document editor.
 *
 * - translateDocument - A function that translates the document content to a different language.
 * - TranslateDocumentInput - The input type for the translateDocument function.
 * - TranslateDocumentOutput - The return type for the translateDocument function.
 * - summarizeDocument - A function that summarizes the document content.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const TranslateDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The current content of the document to be translated.'),
  targetLanguage: z
    .string()
    .describe('The language to translate the document content into.'),
});
export type TranslateDocumentInput = z.infer<
  typeof TranslateDocumentInputSchema
>;

const TranslateDocumentOutputSchema = z.object({
  translatedContent: z
    .string()
    .describe('The translated document content as an HTML string.'),
});
export type TranslateDocumentOutput = z.infer<
  typeof TranslateDocumentOutputSchema
>;

export async function translateDocument(
  input: TranslateDocumentInput
): Promise<TranslateDocumentOutput> {
  return translateDocumentFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateDocumentPrompt',
  input: {schema: TranslateDocumentInputSchema},
  output: {schema: TranslateDocumentOutputSchema},
  config: {
    model: googleAI.model('gemini-1.5-flash-latest'),
  },
  prompt: `You are an expert translator. Translate the following document content into {{targetLanguage}}.
  Return the translated content as an HTML string, preserving the original HTML tags.

  Document Content:
  {{{documentContent}}}
  `,
});

const translateDocumentFlow = ai.defineFlow(
  {
    name: 'translateDocumentFlow',
    inputSchema: TranslateDocumentInputSchema,
    outputSchema: TranslateDocumentOutputSchema,
  },
  async input => {
    const {output} = await translatePrompt(input);
    return output!;
  }
);


const SummarizeDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The current content of the document to be summarized.'),
});
export type SummarizeDocumentInput = z.infer<
  typeof SummarizeDocumentInputSchema
>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the document content.'),
});
export type SummarizeDocumentOutput = z.infer<
  typeof SummarizeDocumentOutputSchema
>;

export async function summarizeDocument(
  input: SummarizeDocumentInput
): Promise<SummarizeDocumentOutput> {
    return summarizeDocumentFlow(input);
}

const summarizePrompt = ai.definePrompt({
    name: 'summarizeDocumentPrompt',
    input: {schema: SummarizeDocumentInputSchema},
    output: {schema: SummarizeDocumentOutputSchema},
    config: {
      model: googleAI.model('gemini-1.5-flash-latest'),
    },
    prompt: `You are an expert at summarizing text. Provide a concise summary of the following document.

    Document Content:
    {{{documentContent}}}
    `,
});


const summarizeDocumentFlow = ai.defineFlow(
    {
        name: 'summarizeDocumentFlow',
        inputSchema: SummarizeDocumentInputSchema,
        outputSchema: SummarizeDocumentOutputSchema,
    },
    async input => {
        const {output} = await summarizePrompt(input);
        return output!;
    }
);

// New AI Flows for References Tab
const GenerateTableOfContentsInputSchema = z.object({
  documentContent: z.string().describe('The HTML content of the document.'),
});
export type GenerateTableOfContentsInput = z.infer<typeof GenerateTableOfContentsInputSchema>;

const GenerateTableOfContentsOutputSchema = z.object({
  toc: z.string().describe('The generated Table of Contents as an HTML string.'),
});
export type GenerateTableOfContentsOutput = z.infer<typeof GenerateTableOfContentsOutputSchema>;

export async function generateTableOfContents(input: GenerateTableOfContentsInput): Promise<GenerateTableOfContentsOutput> {
    return generateTableOfContentsFlow(input);
}

const generateTableOfContentsPrompt = ai.definePrompt({
    name: 'generateTableOfContentsPrompt',
    input: { schema: GenerateTableOfContentsInputSchema },
    output: { schema: GenerateTableOfContentsOutputSchema },
    config: {
      model: googleAI.model('gemini-1.5-flash-latest'),
    },
    prompt: `You are an expert at creating a Table of Contents from an HTML document. Analyze the following HTML for <h1>, <h2>, and <h3> tags and generate a nested unordered list (<ul>) for the Table of Contents. Each list item should be a link to the corresponding heading ID. If headings don't have IDs, you must add a unique slugified ID to each heading tag in the original content. The entire output, including the ToC and the modified content, must be returned.

    Document Content:
    {{{documentContent}}}

    Return the ToC as an HTML string in the 'toc' field.
    `,
});

const generateTableOfContentsFlow = ai.defineFlow(
    {
        name: 'generateTableOfContentsFlow',
        inputSchema: GenerateTableOfContentsInputSchema,
        outputSchema: GenerateTableOfContentsOutputSchema,
    },
    async (input) => {
        // This is a simplified version. A real implementation would parse HTML, add IDs, and build the TOC.
        // For this example, we'll ask the AI to do its best.
        const { output } = await generateTableOfContentsPrompt(input);
        return output!;
    }
);

const InsertCitationInputSchema = z.object({
    documentContent: z.string().describe('The HTML content of the document.'),
    citationDetails: z.string().describe('The details of the citation, e.g., "Author, Year".'),
    citationStyle: z.string().describe('The citation style, e.g., APA, MLA.'),
});
export type InsertCitationInput = z.infer<typeof InsertCitationInputSchema>;

const InsertCitationOutputSchema = z.object({
    updatedDocumentContent: z.string().describe('The document content with the formatted citation inserted at the cursor (or a placeholder).'),
});
export type InsertCitationOutput = z.infer<typeof InsertCitationOutputSchema>;

export async function insertCitation(input: InsertCitationInput): Promise<InsertCitationOutput> {
    return insertCitationFlow(input);
}

const insertCitationPrompt = ai.definePrompt({
    name: 'insertCitationPrompt',
    input: { schema: InsertCitationInputSchema },
    output: { schema: InsertCitationOutputSchema },
     config: {
      model: googleAI.model('gemini-1.5-flash-latest'),
    },
    prompt: `You are an expert in academic citations. Format the following citation details in {{citationStyle}} style and insert it at the end of the document.

    Citation Details: {{citationDetails}}

    Document Content:
    {{{documentContent}}}

    Return the updated HTML in the 'updatedDocumentContent' field.
    `,
});

const insertCitationFlow = ai.defineFlow(
    {
        name: 'insertCitationFlow',
        inputSchema: InsertCitationInputSchema,
        outputSchema: InsertCitationOutputSchema,
    },
    async (input) => {
        const { output } = await insertCitationPrompt(input);
        return output!;
    }
);


const GenerateBibliographyInputSchema = z.object({
    documentContent: z.string().describe('The HTML content of the document containing citations.'),
    citationStyle: z.string().describe('The citation style, e.g., APA, MLA.'),
});
export type GenerateBibliographyInput = z.infer<typeof GenerateBibliographyInputSchema>;

const GenerateBibliographyOutputSchema = z.object({
    bibliography: z.string().describe('The formatted bibliography as an HTML string.'),
});
export type GenerateBibliographyOutput = z.infer<typeof GenerateBibliographyOutputSchema>;

export async function generateBibliography(input: GenerateBibliographyInput): Promise<GenerateBibliographyOutput> {
    return generateBibliographyFlow(input);
}

const generateBibliographyPrompt = ai.definePrompt({
    name: 'generateBibliographyPrompt',
    input: { schema: GenerateBibliographyInputSchema },
    output: { schema: GenerateBibliographyOutputSchema },
     config: {
      model: googleAI.model('gemini-1.5-flash-latest'),
    },
    prompt: `You are an expert in academic writing. Scan the following document for all inline citations. Generate a full bibliography in {{citationStyle}} style.

    Document Content:
    {{{documentContent}}}

    Return the bibliography as an HTML string in the 'bibliography' field.
    `,
});

const generateBibliographyFlow = ai.defineFlow(
    {
        name: 'generateBibliographyFlow',
        inputSchema: GenerateBibliographyInputSchema,
        outputSchema: GenerateBibliographyOutputSchema,
    },
    async (input) => {
        const { output } = await generateBibliographyPrompt(input);
        return output!;
    }
);
