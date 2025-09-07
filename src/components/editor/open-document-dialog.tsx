
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getDocuments, Document } from '@/app/documents/actions';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

export function OpenDocumentDialog({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      getDocuments(user.uid).then(setDocuments);
    }
  }, [isOpen, user]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open Document</DialogTitle>
          <DialogDescription>Select a document to open.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <div className="flex justify-between items-center p-3 rounded-md hover:bg-accent cursor-pointer">
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last modified {formatDistanceToNow(new Date(doc.lastModified), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
