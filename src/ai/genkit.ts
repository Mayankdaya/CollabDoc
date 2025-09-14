import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import nextPlugin from '@genkit-ai/next';
import {config} from 'dotenv';

// Load environment variables from .env
config({ path: '.env' });

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.warn(
    'GEMINI_API_KEY not found. AI features will not work. Please ensure it is set in your .env file.'
  );
}

export const ai = genkit({
  plugins: [
    nextPlugin,
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
});
