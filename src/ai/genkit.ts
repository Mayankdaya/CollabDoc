import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import * as path from 'path';

// Manually read and parse the .env.local file to ensure the API key is loaded.
// This is a workaround for persistent environment variable loading issues in the Next.js/Genkit server setup.
function getApiKey() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envFileContent = fs.readFileSync(envPath, { encoding: 'utf-8' });
      const match = envFileContent.match(/^GEMINI_API_KEY=(.*)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (e) {
    console.error('Failed to read API key from .env.local', e);
  }
  // Fallback to process.env as a last resort.
  return process.env.GEMINI_API_KEY;
}

const geminiApiKey = getApiKey();

if (!geminiApiKey) {
  console.warn(
    'GEMINI_API_KEY not found. AI features will not work. Please ensure it is set in your .env.local file.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
});
