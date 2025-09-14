import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/ai-content-suggestions.ts';
import '@/ai/flows/document-actions.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/editor-tools.ts';
