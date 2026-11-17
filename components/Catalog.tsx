"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

type Status = "available" | "sold" | "all";
type Sort = "recent" | "price-asc" | "price-desc" | "condition";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Catalog({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<Status>("available");
  const [sort, setSort] = useState<Sort>("recent");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const soldCount = products.filter((p) => p.sold).length;

  const list = useMemo(() => {
    const nq = norm(q.trim());
    const out = products.filter((p) => {
      if (status === "available" && p.sold) return false;
      if (status === "sold" && !p.sold) return false;
      if (category !== "all" && p.category !== category) return false;
      if (nq && !norm(`${p.title} ${p.description} ${p.category}`).includes(nq)) return false;
      return true;
    });
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      recent: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      condition: (a, b) => b.condition - a.condition,
    };
    return out.sort((a, b) => Number(a.sold) - Number(b.sold) || by[sort](a, b));
  }, [products, q, category, status, sort]);

  return (
    <div>
      {/* Buscador */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input
          className="input !rounded-full !pl-11"
          placeholder="Buscar productos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          enterKeyHint="search"
        />
      </div>

      {/* Categorías */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          Todo <span className="opacity-60">{products.length}</span>
        </Chip>
        {categories.map(([c, n]) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c} <span className="opacity-60">{n}</span>
          </Chip>
        ))}
      </div>

      {/* Estado + orden */}
      <div className="mt-3 grid grid-cols-3 rounded-full border border-line bg-panel p-1 text-sm sm:max-w-md">
        {([
          ["available", "Disponibles"],
          ["sold", `Vendidos${soldCount ? ` (${soldCount})` : ""}`],
          ["all", "Todos"],
        ] as [Status, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setStatus(k)}
            className={`whitespace-nowrap rounded-full px-2 py-2 font-semibold transition ${status === k ? "bg-white text-ink" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-sm">
        <span className="text-muted">
          {list.length} producto{list.length === 1 ? "" : "s"}
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-white/80 outline-none"
          aria-label="Ordenar"
        >
          <option value="recent">Más recientes</option>
          <option value="price-asc">Menor precio</option>
          <option value="price-desc">Mayor precio</option>
          <option value="condition">Mejor estado</option>
        </select>
      </div>

      {/* Grilla */}
      {list.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-muted">
          <div className="text-5xl">🕳️</div>
          <p className="mt-3">
            {products.length ? "No hay productos con esos filtros." : "Aún no hay productos publicados."}
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-transparent bg-devil-grad text-white" : "border-line bg-panel text-white/80 hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}
