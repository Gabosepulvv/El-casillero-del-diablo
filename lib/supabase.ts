import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import type { Product } from "./types";

let client: SupabaseClient | null = null;

export function isConfigured() {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only client with full access. Never import from client components. */
export function db() {
  if (!isConfigured()) {
    throw new Error(
      "Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function getProducts(): Promise<Product[]> {
  if (!isConfigured()) return [];
  const { data, error } = await db()
    .from("products")
    .select("*")
    .order("sold", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getProducts", error);
    return [];
  }
  return (data ?? []).map(normalize);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error) console.error("getProduct", error);
  return data ? normalize(data) : null;
}

function normalize(p: Product): Product {
  return { ...p, price: Number(p.price), images: p.images ?? [] };
}
