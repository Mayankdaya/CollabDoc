
"use client";

import { getDocument } from '@/app/documents/actions';
import { notFound, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Document } from '@/app/documents/actions';
import { useEffect, useState } from 'react';

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

// Dynamically import the EditorLayout as it is a client component
const EditorLayout = dynamic(() => import('@/components/editor/editor-layout'), {
  ssr: false,
  loading: () => <EditorLoading />,
});


// This is now a client component again to support ssr:false
export default function DocumentPage() {
  const params = useParams<{ id: string }>();
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await getDocument(params.id);
        if (!data) {
          notFound();
        } else {
          setDocumentData(data);
        }
      } catch (error) {
        console.error("Failed to fetch document", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);


  if (isLoading || !documentData) {
    return <EditorLoading />;
  }
  
  // Pass the fetched data as a prop to the client component
  return <EditorLayout documentId={params.id} initialData={documentData} />;
}
