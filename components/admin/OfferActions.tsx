"use client";

import { useTransition } from "react";
import { deleteOffer, markAllOffersSeen, setOfferSeen, setSold } from "@/app/admin/actions";

export function OfferActions({ id, seen, productId, productSold }: { id: string; seen: boolean; productId: string; productSold: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={`flex flex-wrap gap-2 ${pending ? "pointer-events-none opacity-50" : ""}`}>
      <button onClick={() => start(() => setOfferSeen(id, !seen))} className="rounded-full bg-panel-2 px-3 py-1.5 text-xs font-bold">
        {seen ? "Marcar como nueva" : "✓ Vista"}
      </button>
      {!productSold && (
        <button
          onClick={() => {
            if (confirm("¿Marcar este producto como vendido?")) start(() => setSold(productId, true));
          }}
          className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300"
        >
          Vendido 🤝
        </button>
      )}
      <button
        onClick={() => {
          if (confirm("¿Eliminar esta oferta?")) start(() => deleteOffer(id));
        }}
        className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300"
      >
        Eliminar
      </button>
    </div>
  );
}

export function MarkAllSeen() {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => markAllOffersSeen())} className="btn btn-ghost !px-3 !py-1.5 text-xs">
      Marcar todas como vistas
    </button>
  );
}
