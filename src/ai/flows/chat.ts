
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
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are a sophisticated AI assistant integrated into a professional document editor.
Your primary goal is to help users by generating content and modifying the document based on their commands.

- **Content Generation**: If the user's request implies they want to create content (e.g., "write an essay on...", "I need a document about...", "solar system", "a document about elephants"), you MUST use the \`generateNewContent\` tool. The content you generate for the tool should be well-structured HTML using h2, h3, p, and other appropriate tags. If the request is ambiguous, ask for clarification before generating.
- **Document Modification**: If the user asks you to **modify** the document (e.g., "remove the first paragraph," "replace 'cat' with 'dog'"), you MUST use the other provided tools (\`replaceTextInDocument\`, \`deleteTextFromDocument\`, etc.).
- **General Questions**: For all other general questions or conversational chat, provide a helpful text response without using any tools.

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
    const resultText = result.text;

    if (result.toolRequests.length === 0) {
      return {
        response: resultText,
      };
    }

    const toolResponses = await result.runTools({
      context: { documentContent: input.documentContent },
    });

    const firstToolOutput = toolResponses[0]?.output as any;
    const firstToolName = result.toolRequests[0]?.name;

    const documentContent = firstToolOutput?.updatedDocumentContent;
    
    let requiresConfirmation = false;
    let aiResponse = resultText || "I've updated the document for you.";

    if (firstToolName === 'generateNewContent' && documentContent) {
      requiresConfirmation = true;
      // Overwrite the default response with a more specific one for confirmation.
      aiResponse = "I have generated the content for you. Would you like to paste it into the editor?";
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
