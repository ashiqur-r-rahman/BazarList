"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBazar } from '@/context/BazarContext';
import AppLayout from '@/components/AppLayout';
import type { BazarItem, BazarList } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { nanoid } from 'nanoid';

export default function NewBazarPage() {
  const router = useRouter();
  const { addBazarList } = useBazar();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'details' | 'list'>('details');
  const [isSaving, setIsSaving] = useState(false);
  
  // Bazar data
  const [bazarName, setBazarName] = useState('');
  const [bazarDate, setBazarDate] = useState<Date | undefined>();
  const [userName, setUserName] = useState('');
  const [items, setItems] = useState<BazarItem[]>([]);

  useEffect(() => {
    if (user?.displayName) {
      setUserName(user.displayName);
    }
  }, [user]);

  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemUnit, setItemUnit] = useState<BazarItem['unit']>('pcs');

  // Price entry dialog state
  const [priceEntryItem, setPriceEntryItem] = useState<BazarItem | null>(null);
  const [currentPrice, setCurrentPrice] = useState('');

  const handleContinue = () => {
    if (!bazarDate) {
        toast({
            variant: "destructive",
            title: "Missing Date",
            description: "Please select a date for your bazar list.",
        });
        return;
    }
    setStep('list');
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Item Name",
        description: "Please enter a name for the item.",
      });
      return;
    }
    
    const amount = parseFloat(itemAmount);
    if (!itemAmount || isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a positive number for the amount.",
      });
      return;
    }

    const newItem: BazarItem = {
      id: nanoid(),
      name: itemName,
      amount: amount,
      unit: itemUnit,
      price: null,
      isChecked: false,
    };
    setItems(prev => [...prev, newItem]);
    setItemName('');
    setItemAmount('');
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

  const handleFinish = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to save a list.",
        });
        return;
    }

    if (!bazarDate) {
      toast({
          variant: "destructive",
          title: "Missing Date",
          description: "Please provide a date for the bazar list.",
      });
      setStep('details');
      return;
    }

    setIsSaving(true);
    try {
      const finalBazarName = bazarName.trim() || `Bazar - ${format(bazarDate, 'PPP')}`;
      const newList: BazarList = {
        id: nanoid(),
        name: finalBazarName,
        date: bazarDate.toISOString(),
        userName: userName,
        userId: user.uid,
        items: items,
      };
      await addBazarList(newList);
      toast({
        title: "Bazar List Saved!",
        description: "Your new list has been added to your history.",
      });
      router.push('/dashboard');
    } catch (error) {
        console.error("Failed to save bazar list:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your list. Please ensure you have enabled and configured Firestore in your Firebase project.",
        });
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'details':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-center font-headline text-2xl">New Bazar List</CardTitle>
                <CardDescription className="text-center">Give your list a name (optional) and select a date.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bazar-name">Who in Bazar</Label>
                  <Input 
                    id="bazar-name" 
                    placeholder="e.g.,Name (Optional)" 
                    value={bazarName}
                    onChange={(e) => setBazarName(e.target.value)}
                  />
                </div>
                <div className="flex justify-center">
                    <Calendar
                    mode="single"
                    selected={bazarDate}
                    onSelect={setBazarDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" onClick={handleContinue} disabled={!bazarDate}>
                    Continue
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setStep('details')}><ArrowLeft className="mr-2 h-4 w-4" /> Change Details</Button>
            <Card className="bg-accent text-accent-foreground shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">{bazarName.trim() || (bazarDate ? `Bazar - ${format(bazarDate, 'PPP')}` : 'New Bazar')}</CardTitle>
                <CardDescription className="text-accent-foreground/80 flex justify-between items-center pt-1">
                    <span>{bazarDate ? format(bazarDate, 'PPP') : 'No date selected'}</span>
                    <span>{userName}</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-4">
                 <form onSubmit={handleAddItem} className="flex flex-col sm:flex-nowrap gap-2">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-end">
                    <div className="flex-grow min-w-[150px] sm:min-w-0 sm:w-auto">
                       <Label htmlFor="item-name">Item Name</Label>
                      <Input id="item-name" placeholder="e.g., Rice, Potatoes" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <Label htmlFor="item-amount">Amount</Label>
                      <Input
                        id="item-amount"
                        type="number"
                        placeholder="0"
                        value={itemAmount}
                        onChange={(e) => setItemAmount(e.target.value)}
                        className="w-20"
                        min="0"
                      />
                    </div>
                    <div className="w-28 flex-shrink-0">
                      <Label htmlFor="item-unit">Unit</Label>
                      <Select value={itemUnit} onValueChange={(value: BazarItem['unit']) => setItemUnit(value)}>
                        <SelectTrigger id="item-unit" className="w-24">
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
                  </div>
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
                    <span className="text-muted-foreground mr-4">{item.amount} {item.unit}</span>
                    {item.price !== null && <span className="font-bold mr-4">৳{item.price.toFixed(2)}</span>}
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted p-4 rounded-b-lg">
                <h3 className="text-xl font-bold font-headline">Total: ৳{totalAmount.toFixed(2)}</h3>
                <Button onClick={handleFinish} disabled={items.length === 0 || isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Finish'}
                </Button>
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
