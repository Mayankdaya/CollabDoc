
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
  generateNewContent,
  replaceTextInDocument,
} from './editor-tools';
import { googleAI } from '@genkit-ai/googleai';

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
  input: {schema: ChatInputSchema},
  tools: [
    replaceTextInDocument,
    deleteTextFromDocument,
    appendToDocument,
    clearDocument,
    generateNewContent,
  ],
  config: {
    model: googleAI.model('gemini-2.5-flash'),
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are a sophisticated AI assistant integrated into a professional document editor.
  Your goal is to help users by answering their questions, generating content, or by directly modifying the document on their command. The full document content is available to your tools.

  - If the user asks you to **create or generate** a new document (e.g., "write an essay on the solar system"), you MUST use the \`generateNewContent\` tool. The content you generate for the tool should be well-structured HTML using h2, h3, p, and other appropriate tags.
  - If the user asks you to **modify** the document (e.g., "remove the first paragraph," "replace 'cat' with 'dog'"), you MUST use the other provided tools (\`replaceTextInDocument\`, \`deleteTextFromDocument\`, etc.). The document content will be provided to you in the tool's context. Do not ask the user for the content.
  - For all other general questions, provide a helpful response without using any tools.

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
    const result = await chatPrompt(input);
    
    let documentContent: string | undefined = undefined;
    let requiresConfirmation: boolean | undefined = undefined;
    let aiResponse = result.text(); // Capture the AI's text response first.

    if (result.toolRequests.length > 0) {
      const toolResponse = await result.runTools({
        context: {documentContent: input.documentContent},
      });
      
      const firstToolOutput = toolResponse[0]?.output?.updatedDocumentContent;
      const firstToolName = result.toolRequests[0]?.name;
      
      if (firstToolOutput !== undefined) {
        documentContent = firstToolOutput;
        if (firstToolName === 'generateNewContent') {
            requiresConfirmation = true;
        }
      }
      // If the AI didn't provide a text response along with the tool call, create a default one.
      if (!aiResponse) {
          aiResponse = "I've updated the document for you.";
      }
    }

    return {
      response: aiResponse,
      documentContent,
      requiresConfirmation,
    };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
