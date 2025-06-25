"use client";

import AppLayout from '@/components/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    if (loading) {
        return (
             <AppLayout>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="grid gap-1.5 flex-1">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-5 w-3/4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    if (!user) {
        // This should be handled by AppLayout's protected route logic, but it's a good fallback.
        return null;
    }

  return (
    <AppLayout>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Your personal account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || "User Avatar"} data-ai-hint="user avatar" />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1.5">
                            <h2 className="text-2xl font-semibold">{user.displayName || "No Name"}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.displayName || ''} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                    </div>
                     <Button>Update Profile</Button>
                     <Button variant="destructive" onClick={logout}>Log Out</Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
