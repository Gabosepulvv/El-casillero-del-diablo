import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import LoginForm from "@/components/admin/LoginForm";
import ProductActions from "@/components/admin/ProductActions";
import { isAdmin } from "@/lib/auth";
import { getProducts, isConfigured } from "@/lib/supabase";
import { formatPrice, imageUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-800">
            ⚙️ Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY). Revisa el README.
          </div>
        </main>
      </>
    );
  }

  const products = await getProducts();
  const available = products.filter((p) => !p.sold);
  const stats = [
    ["Disponibles", available.length],
    ["Vendidos", products.length - available.length],
    ["Total", products.length],
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

          <section className="mt-5 space-y-3">
            {products.length === 0 && (
              <p className="py-12 text-center text-muted">Aún no tienes productos. ¡Sube el primero! 👇</p>
            )}
            {products.map((p) => (
              <article key={p.id} className="flex gap-3 rounded-2xl border border-line bg-panel p-3">
                <Link href={`/p/${p.id}`} target="_blank" className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-panel-2">
                  {p.images[0] && <img src={imageUrl(p.images[0])} alt="" className={`h-full w-full object-cover ${p.sold ? "grayscale" : ""}`} />}
                  {p.sold && <span className="absolute inset-x-0 bottom-0 bg-red-600 py-0.5 text-center text-[10px] font-black text-white">VENDIDO</span>}
                </Link>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted">
                    <b className="text-fg">{formatPrice(p.price)}</b> · {p.condition}/10 · {p.category}
                  </p>
                  <div className="mt-2">
                    <ProductActions id={p.id} sold={p.sold} title={p.title} />
                  </div>
                </div>
              </article>
            ))}
          </section>

        <Link
          href="/admin/nuevo"
          className="btn btn-primary fixed bottom-5 left-1/2 z-20 -translate-x-1/2 px-6 py-4 text-base shadow-xl shadow-black/20"
        >
          ＋ Nuevo producto
        </Link>
      </main>
    </>
  );
}
