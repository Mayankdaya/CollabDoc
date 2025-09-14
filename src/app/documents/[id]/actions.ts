
"use server";

import { generateContentSuggestions as genAIFlow, findSynonyms as findSynonymsFlow, checkSpellingAndGrammar as checkSpellingAndGrammarFlow, generateDocumentFromTopic as generateDocumentFromTopicFlow } from "@/ai/flows/ai-content-suggestions";
import { translateDocument as translateDocumentFlow, summarizeDocument as summarizeDocumentFlow, generateTableOfContents as generateTableOfContentsFlow, insertCitation as insertCitationFlow, generateBibliography as generateBibliographyFlow } from "@/ai/flows/document-actions";
import { chat as chatFlow } from "@/ai/flows/chat";
import { z } from "zod";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

const GenerateContentSuggestionsInputSchema = z.object({
  documentContent: z
    .string()
    .describe("The current content of the document being edited."),
  cursorPosition: z
    .number()
    .describe(
      "The current cursor position within the document content, used to provide context-aware suggestions."
    ),
  tone: z
    .string()
    .optional()
    .describe(
      "The desired tone of the content, e.g., professional, casual, academic."
    ),
});

export async function generateContentSuggestions(
  input: z.infer<typeof GenerateContentSuggestionsInputSchema>
) {
  const parsed = GenerateContentSuggestionsInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input for content suggestions:", parsed.error.flatten());
    throw new Error("Invalid input for content suggestions.");
  }
  try {
    const result = await genAIFlow(parsed.data);
    return result;
  } catch (error) {
    console.error("Error in generateContentSuggestions flow:", error);
    throw new Error("Failed to generate AI suggestions.");
  }
}

export async function findSynonyms(word: string) {
    if (!word) {
        throw new Error("A word must be provided to find synonyms.");
    }
    try {
        const result = await findSynonymsFlow(word);
        return result;
    } catch (error) {
        console.error("Error in findSynonyms flow:", error);
        throw new Error("Failed to find synonyms.");
    }
}

export async function checkSpellingAndGrammar(documentContent: string) {
    if (!documentContent) {
        throw new Error("Document content must be provided.");
    }
    try {
        const result = await checkSpellingAndGrammarFlow(documentContent);
        return result;
    } catch (error) {
        console.error("Error in checkSpellingAndGrammar flow:", error);
        throw new Error("Failed to check spelling and grammar.");
    }
}

const TranslateDocumentInputSchema = z.object({
    documentContent: z.string(),
    targetLanguage: z.string(),
});

export async function translateDocument(input: z.infer<typeof TranslateDocumentInputSchema>) {
    const parsed = TranslateDocumentInputSchema.safeParse(input);
    if (!parsed.success) {
        console.error("Invalid input for translation:", parsed.error.flatten());
        throw new Error("Invalid input for translation.");
    }
    try {
        const result = await translateDocumentFlow(parsed.data);
        return result;
    } catch (error) {
        console.error("Error in translateDocument flow:", error);
        throw new Error("Failed to translate document.");
    }
}

const SummarizeDocumentInputSchema = z.object({
    documentContent: z.string(),
});

export async function summarizeDocument(input: z.infer<typeof SummarizeDocumentInputSchema>) {
    const parsed = SummarizeDocumentInputSchema.safeParse(input);
    if (!parsed.success) {
        console.error("Invalid input for summary:", parsed.error.flatten());
        throw new Error("Invalid input for summary.");
    }
    try {
        const result = await summarizeDocumentFlow(parsed.data);
        return result;
    } catch (error) {
        console.error("Error in summarizeDocument flow:", error);
        throw new Error("Failed to summarize document.");
    }
}


const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
  documentContent: z.string(),
});

export async function chat(input: z.infer<typeof ChatInputSchema>) {
    const parsed = ChatInputSchema.safeParse(input);
    if (!parsed.success) {
        console.error("Invalid chat input:", parsed.error.flatten());
        throw new Error("Invalid input for chat.");
    }
    try {
        const result = await chatFlow(parsed.data);
        return result;
    } catch (error) {
        console.error("Error in chat flow. Full error object:", error);
        // Re-throw the original error to see the real message in the UI
        throw error;
    }
}

const GenerateDocumentFromTopicInputSchema = z.object({
    topic: z.string(),
});

export async function generateDocumentFromTopic(input: z.infer<typeof GenerateDocumentFromTopicInputSchema>) {
    const parsed = GenerateDocumentFromTopicInputSchema.safeParse(input);
    if (!parsed.success) {
        console.error("Invalid input for topic generation:", parsed.error.flatten());
        throw new Error("Invalid input for topic generation.");
    }
    try {
        return await generateDocumentFromTopicFlow(parsed.data);
    } catch (error) {
        console.error("Error generating document from topic:", error);
        throw new Error("Failed to generate document from topic.");
    }
}


const GenerateTableOfContentsInputSchema = z.object({
  documentContent: z.string(),
});

export async function generateTableOfContents(input: z.infer<typeof GenerateTableOfContentsInputSchema>) {
  const parsed = GenerateTableOfContentsInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input for TOC:", parsed.error.flatten());
    throw new Error("Invalid input for TOC.");
  }
  try {
    return await generateTableOfContentsFlow(parsed.data);
  } catch (error) {
    console.error("Error generating TOC:", error);
    throw new Error("Failed to generate Table of Contents.");
  }
}

const InsertCitationInputSchema = z.object({
  documentContent: z.string(),
  citationDetails: z.string(),
  citationStyle: z.string(),
});

export async function insertCitation(input: z.infer<typeof InsertCitationInputSchema>) {
  const parsed = InsertCitationInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input for citation:", parsed.error.flatten());
    throw new Error("Invalid input for citation.");
  }
  try {
    return await insertCitationFlow(parsed.data);
  } catch (error) {
    console.error("Error inserting citation:", error);
    throw new Error("Failed to insert citation.");
  }
}

const GenerateBibliographyInputSchema = z.object({
  documentContent: z.string(),
  citationStyle: z.string(),
});

export async function generateBibliography(input: z.infer<typeof GenerateBibliographyInputSchema>) {
  const parsed = GenerateBibliographyInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input for bibliography:", parsed.error.flatten());
    throw new Error("Invalid input for bibliography.");
  }
  try {
    return await generateBibliographyFlow(parsed.data);
  } catch (error) {
    console.error("Error generating bibliography:", error);
    throw new Error("Failed to generate bibliography.");
  }
}

const SendMessageSchema = z.object({
    documentId: z.string(),
    message: z.string().min(1),
    user: z.object({
        uid: z.string(),
        displayName: z.string().nullable(),
        photoURL: z.string().nullable(),
    }),
});

export async function sendMessage(input: z.infer<typeof SendMessageSchema>) {
    const parsed = SendMessageSchema.safeParse(input);
    if (!parsed.success) {
        console.error("Invalid input for sending message:", parsed.error.flatten());
        throw new Error("Invalid input for sending message.");
    }
    const { documentId, message, user } = parsed.data;

    if (!user) {
        throw new Error("You must be logged in to send a message.");
    }

    try {
        const messagesRef = collection(db, "documents", documentId, "messages");
        await addDoc(messagesRef, {
            text: message,
            timestamp: serverTimestamp(),
            userId: user.uid,
            userName: user.displayName || "Anonymous",
            userAvatar: user.photoURL || null,
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message.");
    }
}

    