import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import LoginForm from "@/components/admin/LoginForm";
import ProductActions from "@/components/admin/ProductActions";
import { MarkAllSeen, OfferActions } from "@/components/admin/OfferActions";
import { isAdmin } from "@/lib/auth";
import { db, getProducts, isConfigured } from "@/lib/supabase";
import { contactLink, formatPrice, imageUrl, timeAgo } from "@/lib/format";
import type { OfferWithProduct } from "@/lib/types";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  if (!(await isAdmin())) {
    return (
      <main className="px-4">
        <LoginForm />
      </main>
    );
  }

  if (!isConfigured()) {
    return (
      <>
        <AdminHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200">
            ⚙️ Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY). Revisa el README.
          </div>
        </main>
      </>
    );
  }

  const tab = (await searchParams).tab === "ofertas" ? "ofertas" : "productos";
  const [products, offersRes] = await Promise.all([
    getProducts(),
    db()
      .from("offers")
      .select("*, products(id,title,price,images,sold)")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);
  const offers = (offersRes.data ?? []) as OfferWithProduct[];
  const newOffers = offers.filter((o) => !o.seen).length;
  const offersByProduct = new Map<string, number>();
  for (const o of offers) offersByProduct.set(o.product_id, (offersByProduct.get(o.product_id) ?? 0) + 1);

  const available = products.filter((p) => !p.sold);
  const stats = [
    ["Disponibles", available.length],
    ["Vendidos", products.length - available.length],
    ["Ofertas nuevas", newOffers],
  ] as const;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5">
        <div className="grid grid-cols-3 gap-2">
          {stats.map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-line bg-panel p-3 text-center">
              <div className="text-2xl font-black">{v}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted">{l}</div>
            </div>
          ))}
        </div>

        <nav className="mt-5 grid grid-cols-2 rounded-full border border-line bg-panel p-1 text-sm font-bold">
          <Link href="/admin" className={`rounded-full py-2 text-center ${tab === "productos" ? "bg-white text-ink" : "text-muted"}`}>
            Productos ({products.length})
          </Link>
          <Link href="/admin?tab=ofertas" className={`relative rounded-full py-2 text-center ${tab === "ofertas" ? "bg-white text-ink" : "text-muted"}`}>
            Ofertas
            {newOffers > 0 && (
              <span className="ml-1.5 rounded-full bg-devil px-1.5 py-0.5 text-[11px] text-white">{newOffers}</span>
            )}
          </Link>
        </nav>

        {tab === "productos" ? (
          <section className="mt-5 space-y-3">
            {products.length === 0 && (
              <p className="py-12 text-center text-muted">Aún no tienes productos. ¡Sube el primero! 👇</p>
            )}
            {products.map((p) => (
              <article key={p.id} className="flex gap-3 rounded-2xl border border-line bg-panel p-3">
                <Link href={`/p/${p.id}`} target="_blank" className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-panel-2">
                  {p.images[0] && <img src={imageUrl(p.images[0])} alt="" className={`h-full w-full object-cover ${p.sold ? "grayscale" : ""}`} />}
                  {p.sold && <span className="absolute inset-x-0 bottom-0 bg-devil py-0.5 text-center text-[10px] font-black">VENDIDO</span>}
                </Link>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted">
                    <b className="text-white">{formatPrice(p.price)}</b> · {p.condition}/10 · {p.category}
                  </p>
                  {offersByProduct.get(p.id) ? (
                    <Link href="/admin?tab=ofertas" className="text-xs text-devil-2">
                      💸 {offersByProduct.get(p.id)} oferta{offersByProduct.get(p.id) === 1 ? "" : "s"}
                    </Link>
                  ) : null}
                  <div className="mt-2">
                    <ProductActions id={p.id} sold={p.sold} title={p.title} />
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5 space-y-3">
            {offers.length > 0 && newOffers > 0 && (
              <div className="flex justify-end">
                <MarkAllSeen />
              </div>
            )}
            {offers.length === 0 && <p className="py-12 text-center text-muted">Todavía no llegan ofertas. 🕐</p>}
            {offers.map((o) => {
              const prod = o.products;
              const pct = prod && Number(prod.price) > 0 ? Math.round((Number(o.amount) / Number(prod.price)) * 100) : null;
              return (
                <article
                  key={o.id}
                  className={`rounded-2xl border p-4 ${o.seen ? "border-line bg-panel" : "border-devil/60 bg-devil/10"}`}
                >
                  <div className="flex gap-3">
                    {prod?.images?.[0] && (
                      <img src={imageUrl(prod.images[0])} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!o.seen && <span className="rounded-full bg-devil px-2 py-0.5 text-[10px] font-black">NUEVA</span>}
                        <span className="text-xs text-muted">{timeAgo(o.created_at)}</span>
                      </div>
                      <p className="truncate text-sm text-muted">{prod?.title ?? "Producto eliminado"}</p>
                      <p className="text-2xl font-black">
                        {formatPrice(o.amount)}
                        {pct !== null && (
                          <span className={`ml-2 text-sm font-bold ${pct >= 90 ? "text-emerald-400" : pct >= 70 ? "text-amber-300" : "text-red-300"}`}>
                            {pct}% de {formatPrice(prod!.price)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-panel-2 p-3 text-sm">
                    {o.name && <p>🙋 <b>{o.name}</b></p>}
                    <a
                      href={contactLink(o.contact_type, o.contact)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 font-bold text-devil-2 underline-offset-2 hover:underline"
                    >
                      {o.contact_type === "instagram" ? "📸" : "💬"} {o.contact}
                      <span className="text-xs font-normal text-muted">
                        ({o.contact_type === "instagram" ? "abrir Instagram" : "abrir WhatsApp"})
                      </span>
                    </a>
                    {o.contact_type === "phone" && (
                      <a href={`tel:${o.contact.replace(/[^\d+]/g, "")}`} className="ml-3 text-xs text-muted underline">llamar</a>
                    )}
                    {o.message && <p className="mt-2 italic text-white/80">“{o.message}”</p>}
                  </div>
                  <div className="mt-3">
                    <OfferActions id={o.id} seen={o.seen} productId={o.product_id} productSold={prod?.sold ?? true} />
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <Link
          href="/admin/nuevo"
          className="btn btn-primary fixed bottom-5 left-1/2 z-20 -translate-x-1/2 px-6 py-4 text-base shadow-2xl shadow-devil/30"
        >
          ＋ Nuevo producto
        </Link>
      </main>
    </>
  );
}
