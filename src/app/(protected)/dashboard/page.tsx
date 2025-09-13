
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
import { UserMenu } from "@/components/user-menu";
import { NewDocumentDialog } from "@/components/dashboard/new-document-dialog";
import { getDocuments } from "@/app/documents/actions";
import { ShareDialog } from "@/components/editor/share-dialog";
import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { DashboardClient } from "./dashboard-client";


export default async function Dashboard() {
  const session = cookies().get("session")?.value || "";
  let user = null;
  try {
      const decodedClaims = await auth.verifySessionCookie(session, true);
      user = {
          uid: decodedClaims.uid,
          displayName: decodedClaims.name,
          email: decodedClaims.email,
          photoURL: decodedClaims.picture,
      }
  } catch (error) {
      // Session cookie is invalid or expired.
      // The user will be redirected to login by the layout.
  }

  if (!user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
       </div>
    )
  }
  
  const initialDocuments = await getDocuments(user.uid);

  return <DashboardClient initialDocuments={initialDocuments} user={user} />;
}
