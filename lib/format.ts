import { BUCKET, CURRENCY, LOCALE, SUPABASE_URL } from "./config";

const money = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: CURRENCY === "CLP" ? 0 : 2,
});

export function formatPrice(n: number | string) {
  return money.format(Number(n));
}

export function imageUrl(path: string | undefined) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function conditionLabel(c: number) {
  if (c >= 10) return "Nuevo";
  if (c >= 9) return "Como nuevo";
  if (c >= 7) return "Muy buen estado";
  if (c >= 5) return "Buen estado";
  if (c >= 3) return "Usado";
  return "Con detalles";
}

/** Tailwind classes for the condition color (red → green). */
export function conditionColor(c: number) {
  if (c >= 9) return "bg-emerald-500";
  if (c >= 7) return "bg-lime-500";
  if (c >= 5) return "bg-amber-400";
  if (c >= 3) return "bg-orange-500";
  return "bg-red-500";
}

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "hace un momento";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} día${d === 1 ? "" : "s"}`;
  return new Date(iso).toLocaleDateString(LOCALE);
}

export function contactLink(type: "phone" | "instagram", contact: string) {
  if (type === "instagram") {
    return `https://instagram.com/${contact.replace(/^@/, "").trim()}`;
  }
  const digits = contact.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}
