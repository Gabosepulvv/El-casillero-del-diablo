export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: number;
  category: string;
  images: string[];
  sold: boolean;
  /** Link al producto en una tienda, para que el comprador compare el precio original. */
  original_url?: string | null;
  /** Precio original de referencia (opcional). */
  original_price?: number | null;
  sold_at: string | null;
  created_at: string;
};
