
'use client';

import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

// We can't add metadata here because this is a client component.
// export const metadata: Metadata = {
//   title: 'CollabDoc - A Real-Time Collaborative Word Editor',
//   description: 'Simultaneously view, edit, and comment on a single document with changes reflected in near real-time for all participants.',
//   icons: {
//     icon: "/favicon.ico",
//   }
// };


function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname === '/login';
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/documents');

  useEffect(() => {
    if (!loading) {
      if (user && isAuthRoute) {
        router.push('/dashboard');
      } else if (!user && isProtectedRoute) {
        router.push('/login');
      }
    }
  }, [user, loading, router, isProtectedRoute, isAuthRoute, pathname]);
  
  if (loading && isProtectedRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // To prevent flash of login page for authenticated users
  if (loading && isAuthRoute) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
