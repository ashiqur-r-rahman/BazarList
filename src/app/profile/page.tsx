"use client";

import AppLayout from '@/components/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();

    const handleLogout = () => {
        // Mock logout logic
        router.push('/');
    };

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
                            <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1.5">
                            <h2 className="text-2xl font-semibold">John Doe</h2>
                            <p className="text-muted-foreground">m@example.com</p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="m@example.com" disabled />
                    </div>
                     <Button>Update Profile</Button>
                     <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
