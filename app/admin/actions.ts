"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { BUCKET } from "@/lib/config";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function refresh(id?: string) {
  revalidatePath("/");
  if (id) revalidatePath(`/p/${id}`);
  revalidatePath("/admin");
}

// ── Sesión ─────────────────────────────────────────────────────────
export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "Configura ADMIN_PASSWORD en las variables de entorno." };
  }
  // pequeña pausa para frenar ataques de fuerza bruta
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(form.get("password") ?? ""))) {
    return { error: "Contraseña incorrecta." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

// ── Imágenes ──────────────────────────────────────────────────────
export async function createUploadUrls(count: number) {
  await requireAdmin();
  const n = Math.max(0, Math.min(15, Math.floor(count)));
  const out: { path: string; token: string }[] = [];
  for (let i = 0; i < n; i++) {
    const path = `${new Date().getFullYear()}/${randomUUID()}.jpg`;
    const { data, error } = await db().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error("No se pudo preparar la subida: " + error?.message);
    out.push({ path: data.path, token: data.token });
  }
  return out;
}

async function removeImages(paths: string[]) {
  const own = paths.filter((p) => p && !/^https?:\/\//.test(p));
  if (own.length) await db().storage.from(BUCKET).remove(own);
}

// ── Productos ─────────────────────────────────────────────────────
export type ProductInput = {
  title: string;
  description: string;
  price: number;
  condition: number;
  category: string;
  images: string[];
  sold: boolean;
};

function validate(input: ProductInput): string | null {
  if (!input.title?.trim()) return "El título es obligatorio.";
  if (!Number.isFinite(input.price) || input.price < 0) return "Precio inválido.";
  if (!Number.isInteger(input.condition) || input.condition < 1 || input.condition > 10)
    return "El estado debe ser de 1 a 10.";
  if (!input.images?.length) return "Sube al menos una foto.";
  return null;
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<Result> {
  await requireAdmin();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const row = {
    title: input.title.trim().slice(0, 120),
    description: (input.description ?? "").trim().slice(0, 3000),
    price: input.price,
    condition: input.condition,
    category: (input.category ?? "").trim().slice(0, 40) || "Otros",
    images: input.images.slice(0, 15),
    sold: input.sold,
  };

  if (id) {
    const { data: prev } = await db().from("products").select("images,sold").eq("id", id).maybeSingle();
    const { error } = await db()
      .from("products")
      .update({ ...row, sold_at: row.sold ? (prev?.sold ? undefined : new Date().toISOString()) : null })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (prev) await removeImages((prev.images as string[]).filter((p) => !row.images.includes(p)));
    refresh(id);
    return { ok: true, id };
  }

  const { data, error } = await db()
    .from("products")
    .insert({ ...row, sold_at: row.sold ? new Date().toISOString() : null })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  refresh(data.id);
  return { ok: true, id: data.id };
}

export async function setSold(id: string, sold: boolean) {
  await requireAdmin();
  await db()
    .from("products")
    .update({ sold, sold_at: sold ? new Date().toISOString() : null })
    .eq("id", id);
  refresh(id);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const { data } = await db().from("products").select("images").eq("id", id).maybeSingle();
  await db().from("products").delete().eq("id", id);
  if (data) await removeImages(data.images as string[]);
  refresh(id);
}
