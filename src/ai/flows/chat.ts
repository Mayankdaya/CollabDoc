'use server';
/**
 * @fileOverview A conversational AI chat flow.
 *
 * - chat - A function that handles the chat conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  appendToDocument,
  clearDocument,
  deleteTextFromDocument,
  replaceTextInDocument,
} from './editor-tools';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string().describe('The new user message.'),
  documentContent: z.string().describe('The current content of the document.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

// Internal schema includes the escaped content
const InternalChatInputSchema = ChatInputSchema.extend({
  escapedDocumentContent: z.string(),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
  documentContent: z
    .string()
    .optional()
    .describe(
      'If the user requests document creation or modification, this field will contain the updated content as an HTML string.'
    ),
  requiresConfirmation: z
    .boolean()
    .optional()
    .describe(
      'If true, the UI should ask the user for confirmation before performing an action.'
    ),
});
type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: InternalChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [
    replaceTextInDocument,
    deleteTextFromDocument,
    appendToDocument,
    clearDocument,
  ],
  prompt: `You are a sophisticated AI assistant integrated into a professional document editor.
  Your goal is to help users by creating high-quality, well-structured, and visually stunning content, or by directly modifying the document on their command.

  You have two primary capabilities:

  1.  **Document Generation:**
      When a user asks you to create a document (e.g., "write an essay on the solar system"), you must adhere to the following premium formatting standards:
      *   **Generate Content in HTML:** The document must be a single, well-structured HTML string.
      *   **Professional Structure & Style:**
          *   Start with a main title using an \`<h2 style="color: hsl(var(--primary));">\` tag.
          *   Use \`<h3>\` tags for major sections and \`<h4>\` for sub-sections.
          *   Write informative paragraphs using \`<p>\` tags.
          *   Use \`<blockquote>\` to highlight important quotes or key takeaways.
          *   Use \`<strong>\` for emphasis and \`<mark>\` to highlight keywords.
          *   Use \`<table>\` for structured data.
      *   **Set Output Fields:**
          *   Populate the 'documentContent' field with the generated HTML.
          *   Set 'requiresConfirmation' to true.
          *   For the 'response' field, ask for user confirmation in a friendly tone. Example: "I've drafted a document about the solar system for you. Would you like me to paste it into the editor?".

  2.  **Direct Document Editing:**
      When a user asks you to modify the document (e.g., "remove the first paragraph," "replace 'cat' with 'dog'"), you MUST use the provided tools to perform the action.
      *   Analyze the user's request and choose the appropriate tool (\`replaceTextInDocument\`, \`deleteTextFromDocument\`, etc.).
      *   Call the tool with the correct parameters based on the current document content.
      *   The tool will return the modified HTML. You MUST place this modified HTML into the 'documentContent' output field.
      *   For the 'response' field, provide a confirmation message. Example: "I have removed that paragraph for you."

  For all other general questions or simple requests where no document generation or editing is needed, provide a helpful response in the 'response' field and leave the other fields empty.

  Current Document Content:
  {{escapedDocumentContent}}

  Conversation History:
  {{#each history}}
  **{{role}}**: {{content}}
  {{/each}}
  
  New User Message:
  {{message}}
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const escapeHtml = (unsafe: string): string => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    const internalInput = {
      ...input,
      escapedDocumentContent: escapeHtml(input.documentContent),
    };
    const {output} = await chatPrompt(internalInput);
    return output!;
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
