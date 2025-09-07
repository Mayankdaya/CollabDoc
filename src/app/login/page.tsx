
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { CollabDocLogo } from '@/components/collab-doc-logo';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { Spotlight } from '@/components/ui/spotlight';

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <Spotlight
        className="top-20 right-0 md:top-10 md:right-80 rotate-180"
        fill="white"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 mb-4">
            <CollabDocLogo className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-white">CollabDoc</h1>
        </div>
        
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 border-white/10">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
             <SignInForm />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUpForm />
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-neutral-400 backdrop-blur-sm">
              Or continue with
            </span>
          </div>
        </div>

        <Button onClick={signInWithGoogle} size="lg" disabled={loading} variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.6 244 11.6c70.3 0 129.8 28.7 173.4 74.5l-64.8 64.8C314.6 118.3 282.4 102 244 102c-84.3 0-152.3 68.3-152.3 152.3s68 152.3 152.3 152.3c99.1 0 134.3-71.3 139.8-106.3H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
            </svg>
          )}
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
