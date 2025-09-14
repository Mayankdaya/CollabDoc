
'use server';
/**
 * @fileOverview A set of tools that the AI can use to directly manipulate the document editor's content.
 *
 * - replaceTextInDocument - Replaces all occurrences of a specific text string.
 * - deleteTextFromDocument - Deletes all occurrences of a specific text string.
 * - appendToDocument - Appends text to the end of the document.
 * - clearDocument - Clears the entire document content.
 * - generateNewContent - Replaces the entire document with new, AI-generated HTML content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


export const replaceTextInDocument = ai.defineTool(
  {
    name: 'replaceTextInDocument',
    description:
      'Replaces all occurrences of a specific text string in the document. This is useful for find-and-replace operations. The replacement is case-sensitive.',
    inputSchema: z.object({
      textToFind: z.string().describe('The exact text to find in the document.'),
      textToReplaceWith: z
        .string()
        .describe('The text to replace the found text with.'),
    }),
    outputSchema: z.object({
      updatedDocumentContent: z
        .string()
        .describe('The HTML content of the document after the replacement.'),
    }),
  },
  async ({textToFind, textToReplaceWith}, context) => {
    const documentContent = (context.flow?.input as any)?.documentContent || '';
    // Prevent infinite loops by checking for an empty search string.
    if (!textToFind) {
      return { updatedDocumentContent: documentContent };
    }
    const updatedDocumentContent = documentContent.split(textToFind).join(textToReplaceWith);
    return {
      updatedDocumentContent,
    };
  }
);

export const deleteTextFromDocument = ai.defineTool(
  {
    name: 'deleteTextFromDocument',
    description:
      'Deletes all occurrences of a specific text string from the document. Useful for removing sentences or paragraphs. The match is case-sensitive.',
    inputSchema: z.object({
      textToDelete: z
        .string()
        .describe('The exact text to delete from the document.'),
    }),
    outputSchema: z.object({
      updatedDocumentContent: z
        .string()
        .describe('The HTML content of the document after the deletion.'),
    }),
  },
  async ({textToDelete}, context) => {
    const documentContent = (context.flow?.input as any)?.documentContent || '';
     // Prevent infinite loops by checking for an empty search string.
     if (!textToDelete) {
      return { updatedDocumentContent: documentContent };
    }
    const updatedDocumentContent = documentContent.split(textToDelete).join('');
    return {
      updatedDocumentContent,
    };
  }
);

export const appendToDocument = ai.defineTool(
  {
    name: 'appendToDocument',
    description: 'Adds the given HTML content to the very end of the document.',
    inputSchema: z.object({
      htmlToAppend: z
        .string()
        .describe(
          'The HTML content to add to the end of the document. Should be wrapped in appropriate tags, like `<p>text</p>`.'
        ),
    }),
    outputSchema: z.object({
      updatedDocumentContent: z
        .string()
        .describe('The HTML content of the document after the append operation.'),
    }),
  },
  async ({htmlToAppend}, context) => {
    const documentContent = (context.flow?.input as any)?.documentContent || '';
    return {
      updatedDocumentContent: documentContent + htmlToAppend,
    };
  }
);

export const clearDocument = ai.defineTool(
  {
    name: 'clearDocument',
    description:
      'Deletes all content from the document, leaving it completely empty.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.object({
      updatedDocumentContent: z
        .string()
        .describe('The empty HTML content.'),
    }),
  },
  async () => {
    return {
      updatedDocumentContent: '',
    };
  }
);

export const generateNewContent = ai.defineTool(
  {
    name: 'generateNewContent',
    description: 'Use this tool to generate completely new content for the document, such as writing an essay or a report. This will replace the entire existing document.',
    inputSchema: z.object({
        generatedHtmlContent: z.string().describe('The new, well-structured HTML content to populate the document with.'),
    }),
    outputSchema: z.object({
      updatedDocumentContent: z.string().describe('The HTML content for the document.'),
    }),
  },
  async ({ generatedHtmlContent }) => {
    return {
      updatedDocumentContent: generatedHtmlContent,
    };
  }
);
