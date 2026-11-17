import "server-only";
import { SITE_URL } from "./config";
import { contactLink, formatPrice } from "./format";

type OfferNotice = {
  productTitle: string;
  productPrice: number;
  amount: number;
  contactType: "phone" | "instagram";
  contact: string;
  name?: string | null;
  message?: string | null;
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Sends a Telegram message to the store owner. Silently skips if not configured. */
export async function notifyOffer(o: OfferNotice) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const pct = o.productPrice > 0 ? Math.round((o.amount / o.productPrice) * 100) : null;
  const lines = [
    `🔥 <b>¡Nueva oferta!</b>`,
    ``,
    `📦 <b>${esc(o.productTitle)}</b>`,
    `💰 Ofrecen: <b>${formatPrice(o.amount)}</b>` + (pct !== null ? ` (${pct}% de ${formatPrice(o.productPrice)})` : ""),
    o.name ? `🙋 ${esc(o.name)}` : null,
    `${o.contactType === "instagram" ? "📸 IG" : "📱 Tel"}: ${esc(o.contact)}`,
    `👉 ${contactLink(o.contactType, o.contact)}`,
    o.message ? `💬 “${esc(o.message)}”` : null,
    SITE_URL ? `\n🛠 ${SITE_URL}/admin` : null,
  ].filter((l) => l !== null);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error("Telegram error", res.status, await res.text());
  } catch (e) {
    console.error("Telegram error", e);
  }
}
