"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { CURRENCY, LOCALE } from "@/lib/config";

type Props = { productId: string; price: number };

export default function OfferForm({ productId, price }: Props) {
  const [amount, setAmount] = useState("");
  const [contactType, setContactType] = useState<"phone" | "instagram">("phone");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot anti-bots
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const decimals = CURRENCY === "CLP" ? 0 : 2;
  const num = decimals
    ? Number(amount.replace(/[^\d.,]/g, "").replace(",", "."))
    : Number(amount.replace(/[^\d]/g, ""));
  const quick = [0.7, 0.8, 0.9, 1].map((f) => Math.round(price * f / (price >= 10000 ? 1000 : 1)) * (price >= 10000 ? 1000 : 1));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!num || num <= 0) return setError("Ingresa un monto válido.");
    if (contact.trim().length < 3) return setError(contactType === "phone" ? "Ingresa tu número de teléfono." : "Ingresa tu usuario de Instagram.");
    setState("sending");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, amount: num, contactType, contact, name, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la oferta.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="animate-pop rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
        <div className="text-5xl">🤝</div>
        <h3 className="mt-3 text-xl font-bold">¡Oferta enviada!</h3>
        <p className="mt-1 text-sm text-white/80">
          Ofreciste <b>{formatPrice(num)}</b>. Te contactaré por{" "}
          {contactType === "phone" ? "WhatsApp / teléfono" : "Instagram"} a <b>{contact}</b> si me interesa.
        </p>
        <button
          className="btn btn-ghost mt-4 text-sm"
          onClick={() => {
            setState("idle");
            setAmount("");
          }}
        >
          Hacer otra oferta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-panel p-5">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-grotesk)" }}>
        Haz tu oferta 💸
      </h2>
      <p className="mt-1 text-sm text-muted">Te contacto si me sirve. Sin registro, sin compromiso.</p>

      <div className="mt-5">
        <label className="label" htmlFor="amount">¿Cuánto ofreces?</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">$</span>
          <input
            id="amount"
            className="input !pl-9 !text-xl !font-bold"
            inputMode={decimals ? "decimal" : "numeric"}
            placeholder={new Intl.NumberFormat(LOCALE).format(Math.round(price * 0.9))}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        {price > 0 && (
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {[...new Set(quick)].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setAmount(String(v))}
                className="shrink-0 rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-devil"
              >
                {formatPrice(v)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5">
        <span className="label">¿Cómo te contacto?</span>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-panel-2 p-1">
          {([
            ["phone", "📱 Teléfono / WhatsApp"],
            ["instagram", "📸 Instagram"],
          ] as const).map(([k, l]) => (
            <button
              type="button"
              key={k}
              onClick={() => setContactType(k)}
              className={`rounded-xl px-2 py-2.5 text-sm font-semibold transition ${contactType === k ? "bg-white text-ink" : "text-muted"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          className="input mt-2"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={contactType === "phone" ? "+56 9 1234 5678" : "@tu_usuario"}
          inputMode={contactType === "phone" ? "tel" : "text"}
          autoComplete={contactType === "phone" ? "tel" : "off"}
          autoCapitalize="none"
          required
          maxLength={60}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
        <div>
          <label className="label" htmlFor="name">Nombre <span className="normal-case opacity-60">(opcional)</span></label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" />
        </div>
        <div>
          <label className="label" htmlFor="msg">Mensaje <span className="normal-case opacity-60">(opcional)</span></label>
          <input id="msg" className="input" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} placeholder="Ej: puedo retirar hoy" />
        </div>
      </div>

      {/* honeypot: invisible para personas */}
      <input
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
        name="website"
      />

      {error && <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">{error}</p>}

      <button type="submit" disabled={state === "sending"} className="btn btn-primary mt-5 w-full !py-4 text-lg">
        {state === "sending" ? "Enviando…" : "Enviar oferta"}
      </button>
    </form>
  );
}
