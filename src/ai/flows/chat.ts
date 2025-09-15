
'use server';
/**
 * @fileOverview A conversational AI chat flow.
 *
 * - chat - A function that handles the chat conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateDocumentFromTopic,
} from './ai-content-suggestions';
import { googleAI } from '@genkit-ai/googleai';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string().describe('The new user message.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  model: googleAI.model('gemini-pro'),
  prompt: `You are an AI document assistant. Your primary goal is to help users by having a conversation.

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
    return {
      response: result.text,
    };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
