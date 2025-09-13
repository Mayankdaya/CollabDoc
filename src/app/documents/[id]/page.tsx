
import { getDocument } from '@/app/documents/actions';
import { notFound } from 'next/navigation';
import DocumentLoader from './document-loader';


// This is a server component that fetches the initial data.
export default async function DocumentPage({ params }: { params: { id: string } }) {
  const documentData = await getDocument(params.id);

  if (!documentData) {
    notFound();
  }

  // Pass the fetched data as a prop to the client component
  return <DocumentLoader documentId={params.id} initialData={documentData} />;
}
