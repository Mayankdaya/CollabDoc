
'use server';
/**
 * @fileOverview A set of tools that the AI can use to directly manipulate the document editor's content.
 *
 * - replaceTextInDocument - Replaces all occurrences of a specific text string.
 * - deleteTextFromDocument - Deletes all occurrences of a specific text string.
 * - appendToDocument - Appends text to the end of the document.
 * - clearDocument - Clears the entire document content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


export const replaceTextInDocument = ai.defineTool(
  {
    name: 'replaceTextInDocument',
    description:
      'Replaces all occurrences of a specific text string in the document. This is useful for find-and-replace operations. The replacement is case-sensitive.',
    inputSchema: z.object({
      documentContent: z.string().describe('The full HTML content of the document.'),
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
  async ({documentContent, textToFind, textToReplaceWith}) => {
    // Use a safe split-and-join method to prevent infinite loops and stack overflows.
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
      documentContent: z.string().describe('The full HTML content of the document.'),
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
  async ({documentContent, textToDelete}) => {
    // Use a safe split-and-join method to prevent infinite loops and stack overflows.
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
      documentContent: z.string().describe('The full HTML content of the document.'),
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
  async ({documentContent, htmlToAppend}) => {
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
