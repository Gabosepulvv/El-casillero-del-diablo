export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: number;
  category: string;
  images: string[];
  sold: boolean;
  sold_at: string | null;
  created_at: string;
};
