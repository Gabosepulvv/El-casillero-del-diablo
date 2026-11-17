import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, imageUrl } from "@/lib/format";
import { ConditionPill } from "./ConditionBadge";

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const img = imageUrl(p.images[0]);
  return (
    <Link
      href={`/p/${p.id}`}
      className="group animate-pop overflow-hidden rounded-2xl border border-line/70 bg-panel transition hover:border-devil/60"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-panel-2">
        {img ? (
          <img
            src={img}
            alt={p.title}
            loading={index < 4 ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${p.sold ? "grayscale opacity-60" : ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl">📦</div>
        )}
        <div className="absolute left-2 top-2">
          <ConditionPill value={p.condition} />
        </div>
        {p.images.length > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            📷 {p.images.length}
          </span>
        )}
        {p.sold && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="-rotate-12 rounded-lg border-2 border-white bg-devil px-4 py-1 text-lg font-black tracking-widest text-white shadow-xl">
              VENDIDO
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className={`text-lg font-extrabold leading-tight ${p.sold ? "text-muted line-through" : "text-devil-grad"}`}>
          {formatPrice(p.price)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/90">{p.title}</h3>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{p.category}</p>
      </div>
    </Link>
  );
}
