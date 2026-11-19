import { formatPrice } from "@/lib/format";

function storeName(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^(www|simple|listado|articulo)\./, "");
    return host;
  } catch {
    return "la tienda";
  }
}

/** "Consultar precio original en tienda": muestra el precio de referencia y el link a la tienda. */
export default function OriginalPrice({
  url,
  originalPrice,
  price,
}: {
  url?: string | null;
  originalPrice?: number | null;
  price: number;
}) {
  if (!url && !originalPrice) return null;
  const savings = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;

  return (
    <div className="rounded-3xl border border-line bg-panel p-5">
      <span className="label">Precio original en tienda</span>
      {originalPrice ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xl font-bold text-muted line-through">{formatPrice(originalPrice)}</span>
          {savings !== null && savings > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">
              Ahorras {savings}% ({formatPrice(originalPrice - price)})
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">Compara cuánto cuesta este producto nuevo.</p>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn btn-ghost mt-4 w-full text-sm"
        >
          Consultar precio original en {storeName(url)} ↗
        </a>
      )}
      <p className="mt-3 text-xs text-muted">
        Precio de referencia de un producto nuevo; puede haber cambiado en la tienda.
      </p>
    </div>
  );
}
