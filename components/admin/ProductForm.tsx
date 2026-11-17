"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createUploadUrls, saveProduct } from "@/app/admin/actions";
import { BUCKET, CURRENCY, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";
import { conditionColor, conditionLabel, formatPrice, imageUrl } from "@/lib/format";
import { compressImage } from "@/lib/image";
import type { Product } from "@/lib/types";

type Img = { key: string; path?: string; file?: File; preview: string };

export default function ProductForm({ product, categories }: { product?: Product; categories: string[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Img[]>(
    () => product?.images.map((path) => ({ key: path, path, preview: imageUrl(path) })) ?? [],
  );
  const [title, setTitle] = useState(product?.title ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [condition, setCondition] = useState(product?.condition ?? 8);
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sold, setSold] = useState(product?.sold ?? false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // liberar previews locales
  useEffect(() => () => images.forEach((i) => i.file && URL.revokeObjectURL(i.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files]
      .filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name))
      .map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next].slice(0, 15));
  };

  const move = (i: number, d: -1 | 1) =>
    setImages((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (i: number) =>
    setImages((prev) => {
      const it = prev[i];
      if (it.file) URL.revokeObjectURL(it.preview);
      return prev.filter((_, k) => k !== i);
    });

  const priceNum = CURRENCY === "CLP" ? Number(price.replace(/[^\d]/g, "")) : Number(price.replace(",", "."));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!images.length) return setError("Agrega al menos una foto.");
    if (!title.trim()) return setError("Ponle un título.");
    if (!Number.isFinite(priceNum) || price.trim() === "") return setError("Precio inválido.");

    setBusy(true);
    try {
      const pending = images.filter((i) => i.file);
      let uploaded = new Map<string, string>();
      if (pending.length) {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
        const urls = await createUploadUrls(pending.length);
        let done = 0;
        setStatus(`Subiendo fotos 0/${pending.length}…`);
        uploaded = new Map(
          await Promise.all(
            pending.map(async (img, k) => {
              const blob = await compressImage(img.file!);
              const { path, token } = urls[k];
              const { error } = await supabase.storage
                .from(BUCKET)
                .uploadToSignedUrl(path, token, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
              if (error) throw new Error("Error subiendo foto: " + error.message);
              setStatus(`Subiendo fotos ${++done}/${pending.length}…`);
              return [img.key, path] as [string, string];
            }),
          ),
        );
      }
      setStatus("Guardando…");
      const res = await saveProduct(product?.id ?? null, {
        title,
        description,
        price: priceNum,
        condition,
        category,
        sold,
        images: images.map((i) => i.path ?? uploaded.get(i.key)!),
      });
      if (!res.ok) throw new Error(res.error);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setBusy(false);
      setStatus("");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-28">
      {/* Fotos */}
      <section>
        <span className="label">Fotos ({images.length}/15) — la primera es la portada</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.key} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-panel-2">
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">PORTADA</span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm"
                aria-label="Quitar foto"
              >
                ✕
              </button>
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm disabled:opacity-0" aria-label="Mover a la izquierda">←</button>
                <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-sm disabled:opacity-0" aria-label="Mover a la derecha">→</button>
              </div>
            </div>
          ))}
          {images.length < 15 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-line text-muted hover:border-accent hover:text-fg"
            >
              <span className="text-center text-sm">
                <span className="block text-3xl">＋</span>Agregar
              </span>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      <div>
        <label className="label" htmlFor="title">Título</label>
        <input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Ej: Zapatillas Nike Air Max talla 42" required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
        <div>
          <label className="label" htmlFor="price">Precio ({CURRENCY})</label>
          <input id="price" className="input !text-lg !font-bold" inputMode={CURRENCY === "CLP" ? "numeric" : "decimal"} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="25000" required />
          {price && Number.isFinite(priceNum) && <p className="mt-1 text-sm text-muted">{formatPrice(priceNum)}</p>}
        </div>
        <div>
          <label className="label" htmlFor="category">Categoría</label>
          <input id="category" className="input" list="cats" value={category} onChange={(e) => setCategory(e.target.value)} maxLength={40} placeholder="Ropa, Tecnología…" />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {categories.slice(0, 12).map((c) => (
              <button type="button" key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${category === c ? "border-accent bg-accent/20" : "border-line text-muted"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="label !mb-0">Estado del producto</span>
          <span className="text-sm"><b className="text-xl">{condition}</b><span className="text-muted">/10 · {conditionLabel(condition)}</span></span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setCondition(n)}
              className={`h-11 rounded-xl text-sm font-bold transition ${n <= condition ? `${conditionColor(condition)} text-black` : "bg-panel-2 text-muted"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="desc">Descripción</label>
        <textarea id="desc" className="input min-h-32" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} placeholder="Talla, medidas, detalles, por qué lo vendes, dónde se puede retirar…" />
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-line bg-panel p-4">
        <span>
          <b>Marcar como vendido</b>
          <span className="block text-sm text-muted">Seguirá visible en la sección “Vendidos”.</span>
        </span>
        <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} className="h-6 w-6 accent-[#2563eb]" />
      </label>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ink/90 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2">
          <button type="button" onClick={() => router.push("/admin")} className="btn btn-ghost" disabled={busy}>Cancelar</button>
          <button type="submit" className="btn btn-primary flex-1" disabled={busy}>
            {busy ? status || "Guardando…" : product ? "Guardar cambios" : "Publicar producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
