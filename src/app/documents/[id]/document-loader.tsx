
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { Document } from '@/app/documents/actions';

function EditorLoading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-200">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-500">Loading Microsoft Word Editor...</p>
            </div>
        </div>
    );
}

// Directly import the actual editor component that needs client-side rendering
const MicrosoftWordEditor = dynamic(() => import('@/components/editor/microsoft-word-editor').then(mod => mod.MicrosoftWordEditor), {
  ssr: false,
  loading: () => <EditorLoading />,
});

interface DocumentLoaderProps {
    documentId: string;
    initialData: Document;
}

export default function DocumentLoader({ documentId, initialData }: DocumentLoaderProps) {
    return <MicrosoftWordEditor documentId={documentId} initialData={initialData} />;
}
