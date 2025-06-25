"use client";

import Link from 'next/link';
import { useBazar } from '@/context/BazarContext';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { BazarList } from '@/lib/types';

export default function HistoryPage() {
  const { bazarLists, loading } = useBazar();

  const calculateTotal = (list: BazarList) => {
    return list.items.reduce((total, item) => {
      if (item.price) {
        return total + item.price;
      }
      return total;
    }, 0);
  };
  
  const sortedLists = useMemo(() => {
    return [...bazarLists].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bazarLists]);

  if (loading) {
    return <AppLayout><div className="text-center">Loading history...</div></AppLayout>
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Bazar History</h1>
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
                    <CardTitle>{format(new Date(list.date), 'PPP')}</CardTitle>
                    <CardDescription>Created by {list.userName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{list.items.length} items</p>
                    <p className="text-2xl font-bold">${calculateTotal(list).toFixed(2)}</p>
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
