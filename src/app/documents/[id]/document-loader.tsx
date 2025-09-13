
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { Document } from '@/app/documents/actions';

function EditorLoading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading document...</p>
            </div>
        </div>
    );
}

const EditorLayout = dynamic(() => import('@/components/editor/editor-layout'), {
  ssr: false,
  loading: () => <EditorLoading />,
});

interface DocumentLoaderProps {
    documentId: string;
    initialData: Document;
}

export default function DocumentLoader({ documentId, initialData }: DocumentLoaderProps) {
    return <EditorLayout documentId={documentId} initialData={initialData} />;
}
