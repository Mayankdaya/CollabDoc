
import { getAllUsers } from '@/app/users/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export default async function TeamPage() {
    const users = await getAllUsers();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground">A list of all users registered in the system.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users.length > 0 ? (
                    users.map((user) => (
                        <Card key={user.uid} className="flex flex-col items-center justify-center p-6 text-center">
                            <Avatar className="h-20 w-20 mb-4">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                                <AvatarFallback className="text-2xl">{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold">{user.displayName}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                            <Badge variant="secondary">Editor</Badge>
                        </Card>
                    ))
                ) : (
                   <Card className="col-span-full flex items-center justify-center p-10">
                        <p className="text-muted-foreground">No users found.</p>
                   </Card>
                )}
            </div>
        </div>
    );
}
