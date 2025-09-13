
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});
type ProfileData = z.infer<typeof profileSchema>;

const themes = [
  { name: 'Default Dark', className: 'theme-default-dark' },
  { name: 'Word Blue', className: 'theme-word' },
  { name: 'CollabDoc', className: 'theme-collab-doc' },
  { name: 'Light', className: 'theme-light' },
  { name: 'Forest', className: 'theme-forest' },
];

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTheme, setActiveTheme] = useState('theme-default-dark');

    const form = useForm<ProfileData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.displayName || '',
        },
    });

    const applyTheme = (themeName: string) => {
        document.documentElement.classList.forEach(c => {
            if (c.startsWith('theme-')) {
                document.documentElement.classList.remove(c);
            }
        });
        document.documentElement.classList.add(themeName);
        setActiveTheme(themeName);
    };

    async function onSubmit(data: ProfileData) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateProfile(user, { displayName: data.name });
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { displayName: data.name });
            toast({
                title: 'Profile Updated',
                description: 'Your display name has been updated.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update your profile.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Update your profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm font-medium">Select a theme</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => applyTheme(theme.className)}
                                    className={cn(
                                        "p-4 rounded-md border-2 transition-all",
                                        activeTheme === theme.className ? 'border-primary' : 'border-muted'
                                    )}
                                >
                                    <div className={cn("h-12 w-full rounded-md mb-2", theme.className)}></div>
                                    <span className="text-sm">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
