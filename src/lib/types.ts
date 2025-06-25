export type BazarItem = {
  id: string;
  name: string;
  unit: 'pcs' | 'kg' | 'liter' | 'dz' | 'gram';
  price: number | null;
  isChecked: boolean;
};

export type BazarList = {
  id: string;
  date: string; // Storing date as ISO string
  userName: string;
  items: BazarItem[];
};
