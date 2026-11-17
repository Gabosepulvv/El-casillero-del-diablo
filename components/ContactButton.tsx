"use client";

import { useEffect, useState } from "react";
import { WHATSAPP } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export default function ContactButton({ title, price }: { title: string; price: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  if (!WHATSAPP) {
    return (
      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        ⚙️ Falta configurar NEXT_PUBLIC_WHATSAPP.
      </p>
    );
  }

  const text = `¡Hola! 👋 Me interesa "${title}" (${formatPrice(price)}) que vi en tu tienda${url ? `:\n${url}` : "."}\n¿Sigue disponible?`;
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  return (
    <div className="rounded-3xl border border-line bg-panel p-5">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-grotesk)" }}>
        ¿Te interesa? 💬
      </h2>
      <p className="mt-1 text-sm text-muted">Escríbeme por WhatsApp y coordinamos precio y entrega.</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full !py-4 text-lg text-white" style={{ background: "#25D366" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 01-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 01-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.43 9.43 0 019.43 9.44c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0012.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.3l5.7-1.5a11.3 11.3 0 005.74 1.48h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z"/></svg>
        Contactar por WhatsApp
      </a>
    </div>
  );
}
