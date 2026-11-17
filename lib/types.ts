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

export type Offer = {
  id: string;
  product_id: string;
  amount: number;
  contact_type: "phone" | "instagram";
  contact: string;
  name: string | null;
  message: string | null;
  seen: boolean;
  created_at: string;
};

export type OfferWithProduct = Offer & {
  products: Pick<Product, "id" | "title" | "price" | "images" | "sold"> | null;
};
