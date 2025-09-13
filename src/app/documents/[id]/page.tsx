

import { getDocument } from '@/app/documents/actions';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
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

// Dynamically import the EditorLayout as it is a client component.
const EditorLayout = dynamic(() => import('@/components/editor/editor-layout'), {
  ssr: false,
  loading: () => <EditorLoading />,
});

// This is a server component that fetches the initial data.
export default async function DocumentPage({ params }: { params: { id: string } }) {
  const documentData = await getDocument(params.id);

  if (!documentData) {
    notFound();
  }

  // Pass the fetched data as a prop to the client component
  return <EditorLayout documentId={params.id} initialData={documentData} />;
}
