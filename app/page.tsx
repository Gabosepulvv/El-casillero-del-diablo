import Header from "@/components/Header";
import Catalog from "@/components/Catalog";
import { getProducts, isConfigured } from "@/lib/supabase";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/config";

export const revalidate = 30;

export default async function Home() {
  const products = await getProducts();
  const available = products.filter((p) => !p.sold).length;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="py-6 sm:py-10">
          <h1
            className="text-3xl font-bold leading-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-grotesk)" }}
          >
            {STORE_NAME}
          </h1>
          <p className="mt-2 max-w-xl text-muted sm:text-lg">{STORE_TAGLINE}</p>
          {products.length > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-panel-2 px-3 py-1 text-sm font-medium">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {available} disponible{available === 1 ? "" : "s"}
            </p>
          )}
        </section>

        {!isConfigured() && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            ⚙️ Falta configurar Supabase. Sigue los pasos del <b>README</b> para conectar la base de datos.
          </div>
        )}

        <Catalog products={products} />
      </main>
      <footer className="border-t border-line/60 py-6 text-center text-xs text-muted">
        ¿Te interesa algo? Entra al producto y escríbeme por WhatsApp
      </footer>
    </>
  );
}
