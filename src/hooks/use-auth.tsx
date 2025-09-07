
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { SignUpData } from '@/components/auth/sign-up-form';
import { SignInData } from '@/components/auth/sign-in-form';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (data: SignUpData) => Promise<void>;
  signInWithEmail: (data: SignInData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to create a user document in Firestore
const createUserDocument = async (user: User) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    // Ensure we are saving all relevant, available info
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    };
    await setDoc(userRef, userData, { merge: true });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // We get the freshest user data on every auth state change.
        // This is important because `updateProfile` doesn't immediately update the user object.
        await createUserDocument(user);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting user and creating the document
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
        setLoading(false);
    }
  };

  const signUpWithEmail = async ({ name, email, password }: SignUpData) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // **THIS IS THE CRITICAL FIX**: Update the profile immediately after creation
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create the user document with the new display name
      const updatedUser = {
        ...userCredential.user,
        displayName: name,
      } as User

      await createUserDocument(updatedUser);

      // We don't need to call setUser here as onAuthStateChanged will fire
      // and it will now have the correct displayName.
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing up with email: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async ({ email, password }: SignInData) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with email: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut, signUpWithEmail, signInWithEmail };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
