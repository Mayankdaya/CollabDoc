
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { OnlineUser } from '@/app/status/actions';
import { Loader2 } from 'lucide-react';

export default function OnlineUsersPage() {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const statusCollection = collection(db, 'status');
        const q = query(statusCollection, where('state', '==', 'online'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const users: OnlineUser[] = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data() as OnlineUser);
            });
            setOnlineUsers(users);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching online users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Online Users</h1>
                <p className="text-muted-foreground">A real-time list of users who are currently active.</p>
            </div>
            
            {onlineUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {onlineUsers.map(user => (
                        <Card key={user.uid}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-lg truncate">{user.displayName || 'Anonymous'}</CardTitle>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline" className="border-green-500 text-green-500">
                                    Online
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No users are currently online.</p>
                </div>
            )}
        </div>
    );
}
