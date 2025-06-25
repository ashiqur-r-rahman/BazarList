"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Check, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBazar } from '@/context/BazarContext';
import AppLayout from '@/components/AppLayout';
import type { BazarItem, BazarList } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

export default function NewBazarPage() {
  const router = useRouter();
  const { addBazarList } = useBazar();
  const { toast } = useToast();

  const [step, setStep] = useState<'date' | 'name' | 'list'>('date');
  
  // Bazar data
  const [bazarDate, setBazarDate] = useState<Date | undefined>();
  const [userName, setUserName] = useState('');
  const [items, setItems] = useState<BazarItem[]>([]);

  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState<BazarItem['unit']>('pcs');

  // Price entry dialog state
  const [priceEntryItem, setPriceEntryItem] = useState<BazarItem | null>(null);
  const [currentPrice, setCurrentPrice] = useState('');

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBazarDate(date);
      setStep('name');
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setStep('list');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    const newItem: BazarItem = {
      id: Date.now().toString(),
      name: itemName,
      unit: itemUnit,
      price: null,
      isChecked: false,
    };
    setItems(prev => [...prev, newItem]);
    setItemName('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePriceSubmit = () => {
    if (priceEntryItem && currentPrice) {
      const price = parseFloat(currentPrice);
      if (!isNaN(price)) {
        setItems(items.map(item => item.id === priceEntryItem.id ? { ...item, price, isChecked: true } : item));
        setPriceEntryItem(null);
        setCurrentPrice('');
      }
    }
  };

  const handleCheckChange = (checked: boolean, item: BazarItem) => {
    if (checked) {
      setPriceEntryItem(item);
    } else {
      setItems(items.map(i => i.id === item.id ? { ...i, isChecked: false, price: null } : i));
    }
  };

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.isChecked && item.price) {
        return total + item.price;
      }
      return total;
    }, 0);
  }, [items]);

  const handleFinish = () => {
    const newList: BazarList = {
      id: Date.now().toString(),
      date: bazarDate!.toISOString(),
      userName: userName,
      items: items,
    };
    addBazarList(newList);
    toast({
      title: "Bazar List Saved!",
      description: "Your new list has been added to your history.",
    });
    router.push('/dashboard');
  };

  const renderContent = () => {
    switch (step) {
      case 'date':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-center font-headline text-2xl">Select Bazar Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={bazarDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        );
      case 'name':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                 <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setStep('date')}><ArrowLeft /></Button>
                <CardTitle className="text-center font-headline text-2xl">Enter Your Name</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-lg p-6"
                    required
                  />
                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-6">
            <Card className="bg-accent text-accent-foreground shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="font-bold">{format(bazarDate!, 'PPP')}</div>
                <div className="font-bold">{userName}</div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-4">
                <form onSubmit={handleAddItem} className="flex gap-2 items-end">
                  <div className="flex-grow">
                     <Label htmlFor="item-name">Item Name</Label>
                    <Input id="item-name" placeholder="e.g., Rice, Potatoes" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="item-unit">Unit</Label>
                    <Select value={itemUnit} onValueChange={(value: BazarItem['unit']) => setItemUnit(value)}>
                      <SelectTrigger id="item-unit" className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="gram">gram</SelectItem>
                        <SelectItem value="dz">dz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader><CardTitle>Item List</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 && <p className="text-muted-foreground text-center p-4">No items added yet.</p>}
                {items.map(item => (
                  <div key={item.id} className="flex items-center p-2 rounded-md bg-secondary/50">
                    <Checkbox id={`item-${item.id}`} checked={item.isChecked} onCheckedChange={(checked) => handleCheckChange(Boolean(checked), item)} className="mr-4" />
                    <Label htmlFor={`item-${item.id}`} className="flex-grow text-lg">{item.name}</Label>
                    <span className="text-muted-foreground mr-4">{item.unit}</span>
                    {item.price !== null && <span className="font-bold mr-4">${item.price.toFixed(2)}</span>}
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted p-4 rounded-b-lg">
                <h3 className="text-xl font-bold font-headline">Total: ${totalAmount.toFixed(2)}</h3>
                <Button onClick={handleFinish} disabled={items.length === 0}>Finish</Button>
              </CardFooter>
            </Card>

            <Dialog open={!!priceEntryItem} onOpenChange={() => setPriceEntryItem(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter price for {priceEntryItem?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceSubmit()}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPriceEntryItem(null)}>Cancel</Button>
                  <Button onClick={handlePriceSubmit}>Set Price</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 h-full">
        {renderContent()}
      </div>
    </AppLayout>
  );
}
