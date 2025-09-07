# CollabDoc Application Features

This document outlines the key features and capabilities of the CollabDoc real-time collaborative editor application.

## 1. Core Editor & Collaboration

-   **Real-Time Collaborative Editing**: Multiple users can edit the same document simultaneously. Changes, cursor positions, and text selections are reflected in real-time for all participants, powered by **Tiptap**, **Y.js**, and **WebRTC**.
-   **Rich Text Formatting**: A comprehensive toolbar provides extensive formatting options, including:
    -   Bold, Italic, Underline, Strikethrough
    -   Headings (Levels 1-3) and Paragraphs
    -   Font Family and Font Size selection
    -   Text Color and Text Highlighting
    -   Bulleted and Ordered Lists
    -   Text Alignment (Left, Center, Right, Justify)
-   **Content Insertion**: Users can easily insert complex elements like:
    -   Images via URL
    -   Tables with dynamic row/column management
    -   Horizontal Rules
-   **Real-Time User Presence**:
    -   Avatars of all currently online users are displayed in the editor header.
    -   The "Team" panel shows an "online" status indicator for active users.

## 2. User & Document Management

-   **User Authentication**: Secure user authentication is handled by Firebase Auth, supporting:
    -   Email and Password (Sign Up & Sign In)
    -   Google Account (OAuth)
-   **Dashboard**: A central dashboard where logged-in users can:
    -   View all their documents (owned or shared).
    -   Create new documents.
    -   Search, edit, or delete their documents.
-   **Public Document Sharing**: Documents can be shared with anyone via a direct URL, allowing for open collaboration without requiring users to be explicitly invited.
-   **Collaborator Management**:
    -   A "Share" dialog allows document owners to invite other registered users by email.
    -   The "Team" panel within the editor lists all users who have access to the document (the owner and collaborators).

## 3. AI-Powered Features (Genkit)

The application leverages the Genkit framework with the Gemini AI model to provide powerful generative AI capabilities.

-   **AI Assistant Chat**: A dedicated "AI Chat" panel allows users to have a conversation with an AI assistant. Users can:
    -   Ask the AI to generate new document content (e.g., "Write an essay about the solar system").
    -   Command the AI to directly edit the document (e.g., "Remove the second paragraph" or "Replace all instances of 'AI' with 'Artificial Intelligence'").
-   **Document Actions**:
    -   **Translate**: Automatically translate the entire document into various languages (Spanish, French, German, etc.).
    -   **Summarize**: Generate a concise summary of the document's content.
-   **Writing Assistance**:
    -   **Thesaurus**: Select a word to get a list of synonyms.
    -   **Spelling & Grammar Check**: Review the entire document for spelling and grammar errors and receive suggestions.
-   **Academic & Reference Tools**:
    -   **Generate Table of Contents**: Automatically create a `<ul>` based on the document's headings.
    -   **Insert Citations**: Format and insert academic citations in styles like APA, MLA, etc.
    -   **Generate Bibliography**: Scan the document for citations and create a formatted bibliography.

## 4. User Interface & Experience

-   **Modern UI**: Built with **Next.js**, **React**, **ShadCN UI**, and **Tailwind CSS**.
-   **Responsive Design**: The application is fully responsive and works seamlessly on desktop and mobile devices.
-   **In-App Calling**:
    -   Users can start a **voice** or **video call** directly within the editor for seamless communication.
    -   The call panel is draggable and provides controls for muting, toggling video, and ending the call.
-   **Intuitive Layout**: A tabbed interface in the editor sidebar provides easy access to Comments, AI Chat, and the Team list.

## 5. Application Architecture

-   **Frontend**: **Next.js 15** with the App Router.
-   **Backend & Database**: **Firebase** (Firestore for database, Firebase Auth for users).
-   **Styling**: **Tailwind CSS** and **ShadCN UI** components.
-   **AI Integration**: **Genkit** with the **Google Gemini** model.
-   **Real-Time Sync**: **Y.js** with the **y-webrtc** provider.
