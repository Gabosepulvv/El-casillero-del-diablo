export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "El Casillero del Diablo";
export const STORE_TAGLINE =
  process.env.NEXT_PUBLIC_STORE_TAGLINE || "Cosas que ya no uso, a buen precio 😈";
export const INSTAGRAM = (process.env.NEXT_PUBLIC_INSTAGRAM || "").replace(/^@/, "");
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "CLP";
export const LOCALE = process.env.NEXT_PUBLIC_LOCALE || "es-CL";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const BUCKET = "products";

export const DEFAULT_CATEGORIES = [
  "Ropa",
  "Zapatillas",
  "Tecnología",
  "Videojuegos",
  "Hogar",
  "Libros",
  "Deportes",
  "Accesorios",
  "Otros",
];
