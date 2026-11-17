"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteProduct, setSold } from "@/app/admin/actions";

export default function ProductActions({ id, sold, title }: { id: string; sold: boolean; title: string }) {
  const [pending, start] = useTransition();
  return (
    <div className={`flex flex-wrap gap-2 ${pending ? "pointer-events-none opacity-50" : ""}`}>
      <button
        onClick={() => start(() => setSold(id, !sold))}
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${sold ? "bg-panel-2 text-white" : "bg-emerald-500 text-black"}`}
      >
        {sold ? "↩︎ Volver a disponible" : "✓ Marcar vendido"}
      </button>
      <Link href={`/admin/editar/${id}`} className="rounded-full bg-panel-2 px-3 py-1.5 text-xs font-bold">
        ✎ Editar
      </Link>
      <button
        onClick={() => {
          if (confirm(`¿Eliminar "${title}" para siempre?`)) start(() => deleteProduct(id));
        }}
        className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300"
      >
        🗑 Eliminar
      </button>
    </div>
  );
}
