"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBazar } from '@/context/BazarContext';
import AppLayout from '@/components/AppLayout';
import type { BazarList } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getBazarList, loading } = useBazar();
  const [list, setList] = useState<BazarList | undefined>(undefined);
  const [listFound, setListFound] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && params.id) {
      const bazarId = Array.isArray(params.id) ? params.id[0] : params.id;
      const foundList = getBazarList(bazarId);
      setList(foundList);
      setListFound(!!foundList);
    }
  }, [params.id, getBazarList, loading]);

  const totalAmount = useMemo(() => {
    if (!list) return 0;
    return list.items.reduce((total, item) => {
      if (item.isChecked && item.price) {
        return total + item.price;
      }
      return total;
    }, 0);
  }, [list]);

  if (loading || listFound === null) {
    return (
        <AppLayout>
            <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </AppLayout>
    );
  }

  if (!list) {
     return <AppLayout><p className="text-center">Bazar list not found.</p></AppLayout>;
  }

  return (
    <AppLayout>
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
       <div className="space-y-6">
            <Card className="bg-accent text-accent-foreground shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="font-bold">{format(new Date(list.date), 'PPP')}</div>
                <div className="font-bold">{list.userName}</div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader><CardTitle>Items</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {list.items.length === 0 && <p className="text-muted-foreground text-center p-4">No items were in this list.</p>}
                {list.items.map(item => (
                  <div key={item.id} className="flex items-center p-2 rounded-md bg-secondary/50">
                    <div className="mr-4">
                        {item.isChecked ? <Check className="text-accent" /> : <X className="text-destructive" />}
                    </div>
                    <span className="flex-grow text-lg">{item.name}</span>
                    <span className="text-muted-foreground mr-4">{item.unit}</span>
                    {item.price !== null && <span className="font-bold mr-4">${item.price.toFixed(2)}</span>}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-end items-center bg-muted p-4 rounded-b-lg">
                <h3 className="text-xl font-bold font-headline">Total: ${totalAmount.toFixed(2)}</h3>
              </CardFooter>
            </Card>
        </div>
    </AppLayout>
  );
}
