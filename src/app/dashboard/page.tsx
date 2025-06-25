"use client";

import Link from 'next/link';
import { Plus, History } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Manage your shopping lists here.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Link href="/new-bazar">
            <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">
                  + New Bazar
                </CardTitle>
                <Plus className="h-8 w-8" />
              </CardHeader>
              <CardDescription className="text-primary-foreground/80 p-6 pt-0">
                Start a new shopping list for your next bazar.
              </CardDescription>
            </Card>
          </Link>
          <Link href="/history">
            <Card className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold font-headline">
                  History
                </CardTitle>
                <History className="h-8 w-8" />
              </CardHeader>
               <CardDescription className="text-secondary-foreground/80 p-6 pt-0">
                View your past shopping lists and expenses.
              </CardDescription>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
