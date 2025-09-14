require('dotenv').config({ path: '.env.local' });
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
