
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { Document } from '@/app/documents/actions';
import { EditorLayout } from '@/components/editor/editor-layout';

function EditorLoading() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Editor...</p>
            </div>
        </div>
    );
}

// Dynamically import the editor layout which contains the editor and all its tooling.
// This is a heavy component, so we don't want it on the initial page load.
const EditorLayoutWithNoSSR = dynamic(() => import('@/components/editor/editor-layout').then(mod => mod.EditorLayout), {
  ssr: false,
  loading: () => <EditorLoading />,
});

interface DocumentLoaderProps {
    documentId: string;
    initialData: Document;
}

export default function DocumentLoader({ documentId, initialData }: DocumentLoaderProps) {
    return <EditorLayoutWithNoSSR documentId={documentId} initialData={initialData} />;
}
