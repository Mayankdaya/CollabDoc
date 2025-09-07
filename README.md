# CollabDoc - Real-Time Collaborative Editor

This is a real-time collaborative editor application built with Next.js, Firebase, and Genkit AI.

## Features

- **Real-Time Collaboration**: Multiple users can edit documents simultaneously with live cursor tracking.
- **Rich Text Editor**: A full-featured editor with formatting options for headings, text styles, lists, tables, and more.
- **AI-Powered Assistance**:
  - **AI Chat**: A conversational assistant to help generate and modify document content.
  - **Document Tools**: Summarize, translate, and generate bibliographies.
  - **Writing Aids**: Check spelling and grammar, and find synonyms.
- **User Authentication**: Secure sign-up and sign-in with email/password and Google.
- **In-App Calling**: Start voice or video calls directly within the editor.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Firebase (Firestore, Firebase Auth)
- **AI Integration**: Genkit with Google Gemini
- **Real-Time Sync**: Y.js & WebRTC
- **UI**: React, ShadCN UI, Tailwind CSS

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js (v18 or higher) and npm installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Mayankdaya/CollabDoc.git
    cd CollabDoc
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Firebase configuration details from your Firebase project settings.
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and open a pull request.
