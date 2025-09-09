
"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  PanelLeft,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteDocument, Document } from "@/app/documents/actions";
import { useEffect, useState, memo, useCallback } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";
import { NewDocumentDialog } from "@/components/dashboard/new-document-dialog";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, QueryDocumentSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getDocuments } from "@/app/documents/actions";
import { ShareDialog } from "@/components/editor/share-dialog";


const DeleteAction = memo(function DeleteAction({ id, userId, onDeleted }: { id: string; userId: string, onDeleted: (id: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteDocumentWithId = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument({id, userId});
      toast({ title: 'Document Deleted', description: 'The document has been successfully deleted.' });
      onDeleted(id);
    } catch (error) {
      console.error("Failed to delete document", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete document.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenuItem
      className="text-destructive"
      onSelect={(e) => e.preventDefault()}
      onClick={deleteDocumentWithId}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </DropdownMenuItem>
  );
});


export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toggleSidebar, isMobile } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    getDocuments(user.uid)
      .then(docs => {
        setDocuments(docs);
        setFilteredDocuments(docs);
      })
      .catch(error => {
        console.error("Failed to fetch documents:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    const results = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(results);
  }, [searchTerm, documents]);


  const handleDocumentDeleted = useCallback((deletedId: string) => {
      setDocuments(docs => docs.filter(doc => doc.id !== deletedId));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-0">
           {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="-ml-2">
                <PanelLeft />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            )}
           <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="ml-auto flex items-center gap-2 md:grow-0">
                <NewDocumentDialog>
                    <Button size="sm" className="h-9 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        New Document
                    </span>
                    </Button>
                </NewDocumentDialog>
                <div className="hidden md:block">
                    <UserMenu />
                </div>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 md:gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex-1">
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>
                    Manage your documents and invite collaborators.
                    </CardDescription>
                </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden lg:table-cell">
                        Last Modified
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                        Modified By
                        </TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                <div className="flex justify-center items-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                                <Link href={`/documents/${doc.id}`} className="hover:underline">
                                {doc.name}
                                </Link>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {formatDistanceToNow(new Date(doc.lastModified), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {doc.lastModifiedBy}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild><Link href={`/documents/${doc.id}`} className="w-full">Edit</Link></DropdownMenuItem>
                                    <ShareDialog doc={doc}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Share</DropdownMenuItem>
                                    </ShareDialog>
                                    {user && doc.userId === user.uid && <DeleteAction id={doc.id} userId={user.uid} onDeleted={handleDocumentDeleted} />}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center p-4 text-muted-foreground">
                                {searchTerm ? 'No documents match your search.' : "You don't have any documents yet."}
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
