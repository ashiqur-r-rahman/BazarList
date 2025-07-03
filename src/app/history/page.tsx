"use client";

import Link from 'next/link';
import { useBazar } from '@/context/BazarContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { BazarList } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const { bazarLists, loading, clearAllHistory } = useBazar();
  const { toast } = useToast();

  const calculateTotal = (list: BazarList) => {
    return list.items.reduce((total, item) => {
      if (item.isChecked && item.price) {
        return total + item.price;
      }
      return total;
    }, 0);
  };
  
  const sortedLists = useMemo(() => {
    return [...bazarLists].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bazarLists]);
  
  const handleDeleteAll = async () => {
    await clearAllHistory();
    toast({
      title: "History Cleared",
      description: "All your bazar lists have been deleted.",
    });
  };

  if (loading) {
    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Bazar History</h1>
            {sortedLists.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All History
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your bazar lists from the database.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll}>
                            Yes, delete everything
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>

        {sortedLists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">You have no past bazar lists.</p>
            <Link href="/new-bazar" className="text-primary underline mt-2 inline-block">Start a new one</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedLists.map(list => (
              <Link href={`/history/${list.id}`} key={list.id}>
                <Card className="hover:shadow-lg hover:border-primary transition-all">
                  <CardHeader>
                    <CardTitle>{list.name}</CardTitle>
                    <CardDescription>{format(new Date(list.date), 'PPP')} &bull; by {list.userName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{list.items.length} items</p>
                    <p className="text-2xl font-bold">৳{calculateTotal(list).toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
