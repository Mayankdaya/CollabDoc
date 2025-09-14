
import { ai } from '@/ai/genkit';
import { chat } from './flows/chat';
import { assert } from 'console';

ai.defineEval('chat-test', async () => {
  const response = await chat({
    history: [],
    message: 'Hello, write a short paragraph about space.',
    documentContent: '<p>This is the initial document.</p>',
  });

  console.log('AI Response:', response);

  return {
    testCases: [
      {
        output: response.response,
        context: [
          'The response should be a paragraph about space.',
          'The response should not be empty.',
        ],
      },
    ],
  };
});
