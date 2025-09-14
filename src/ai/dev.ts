
import '@/ai/flows/ai-content-suggestions.ts';
import '@/ai/flows/document-actions.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/editor-tools.ts';
import '@/ai/test-chat.ts';

import { ai } from '@/ai/genkit';
import { assert } from 'console';

const simpleApiTestFlow = ai.defineFlow(
  {
    name: 'simpleApiTestFlow',
  },
  async () => {
    try {
        const llmResponse = await ai.generate({
            prompt: 'Hello! Tell me a fun fact about space in one sentence.',
        });

        const responseText = llmResponse.text();
        console.log('✅ Success! API Response:');
        console.log(responseText);
        return {
            success: true,
            response: responseText,
        };
    } catch (error: any) {
        console.error('❌ Error during API test:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }
  }
);


ai.defineEval('api-key-test', async () => {
  console.log('🧪 Simple API Test Running...');
  const result = await simpleApiTestFlow();

  return {
    testCases: [
      {
        output: result.response,
        context: [
          'The response should be a fun fact about space.',
          'The success flag should be true.',
        ],
        // A simple pass/fail check
        evaluators: [(output) => ({
            pass: result.success,
            message: result.success ? "API key is working." : `Test failed: ${result.error}`
        })],
      },
    ],
  };
});
