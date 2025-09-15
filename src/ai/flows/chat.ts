
'use server';
/**
 * @fileOverview A conversational AI chat flow.
 *
 * - chat - A function that handles the chat conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateNewContent,
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
});
type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  tools: [
    generateNewContent,
  ],
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an AI document assistant. Your primary goal is to help users by generating document content.

- If the user's message is a request to write, create, or generate content on any topic (e.g., "solar system", "write an essay about dogs", "a document about elephants"), you **MUST** use the \`generateNewContent\` tool. The content for the tool must be well-structured HTML.
- For all other general questions or conversation, provide a helpful text response without using any tools.

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
    
    if (result.toolRequests.length === 0) {
      return {
        response: result.text,
      };
    }

    const toolResponses = await result.runTools();

    const firstToolOutput = toolResponses[0]?.output as any;

    return {
      response: "I've updated the document for you.",
      documentContent: firstToolOutput?.updatedDocumentContent,
    };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
