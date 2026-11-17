import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Gallery from "@/components/Gallery";
import OfferForm from "@/components/OfferForm";
import ShareButton from "@/components/ShareButton";
import ProductCard from "@/components/ProductCard";
import { ConditionMeter } from "@/components/ConditionBadge";
import { getProduct, getProducts } from "@/lib/supabase";
import { formatPrice, imageUrl, timeAgo } from "@/lib/format";

export const revalidate = 30;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProduct((await params).id);
  if (!p) return { title: "Producto no encontrado" };
  const desc = `${formatPrice(p.price)} · Estado ${p.condition}/10 · ${p.description}`.slice(0, 160);
  return {
    title: p.title,
    description: desc,
    openGraph: {
      title: `${p.title} — ${formatPrice(p.price)}`,
      description: desc,
      images: p.images[0] ? [imageUrl(p.images[0])] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();

  const others = (await getProducts())
    .filter((o) => o.id !== p.id && !o.sold)
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
    .slice(0, 4);

  return (
    <>
      <Header back />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 [&>*]:min-w-0">
          <div className="md:sticky md:top-20 md:self-start">
            <Gallery images={p.images.map(imageUrl)} alt={p.title} sold={p.sold} />
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-panel-2 px-3 py-1 font-semibold uppercase tracking-wide text-muted">
                  {p.category}
                </span>
                <span className="text-muted">Publicado {timeAgo(p.created_at)}</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl" style={{ fontFamily: "var(--font-grotesk)" }}>
                {p.title}
              </h1>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className={`text-3xl font-black sm:text-4xl ${p.sold ? "text-muted line-through" : "text-devil-grad"}`}>
                  {formatPrice(p.price)}
                </p>
                <ShareButton title={p.title} />
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-panel p-5">
              <ConditionMeter value={p.condition} />
            </div>

            {p.description && (
              <div className="rounded-3xl border border-line bg-panel p-5">
                <span className="label">Descripción</span>
                <p className="whitespace-pre-line leading-relaxed text-white/90">{p.description}</p>
              </div>
            )}

            {p.sold ? (
              <div className="rounded-3xl border border-devil/40 bg-devil/10 p-6 text-center">
                <div className="text-4xl">😈</div>
                <p className="mt-2 font-bold">Este producto ya se vendió</p>
                <p className="mt-1 text-sm text-muted">Revisa los demás productos disponibles 👇</p>
              </div>
            ) : (
              <OfferForm productId={p.id} price={p.price} />
            )}
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-grotesk)" }}>
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {others.map((o, i) => (
                <ProductCard key={o.id} p={o} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
