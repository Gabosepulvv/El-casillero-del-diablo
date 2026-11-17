import { NextResponse } from "next/server";
import { db, isConfigured } from "@/lib/supabase";
import { notifyOffer } from "@/lib/notify";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "La tienda aún no está configurada." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Honeypot: los bots rellenan este campo; respondemos OK sin guardar nada.
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const productId = clean(body.productId, 40);
  const amount = Number(body.amount);
  const contactType = body.contactType === "instagram" ? "instagram" : "phone";
  let contact = clean(body.contact, 60);
  const name = clean(body.name, 60) || null;
  const message = clean(body.message, 300) || null;

  if (!/^[0-9a-f-]{36}$/i.test(productId)) {
    return NextResponse.json({ error: "Producto inválido." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e10) {
    return NextResponse.json({ error: "Ingresa un monto válido." }, { status: 400 });
  }
  if (contactType === "phone") {
    const digits = contact.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return NextResponse.json({ error: "Ingresa un número de teléfono válido." }, { status: 400 });
    }
  } else {
    contact = "@" + contact.replace(/^@+/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "");
    if (!/^@[A-Za-z0-9._]{1,30}$/.test(contact)) {
      return NextResponse.json({ error: "Ingresa un usuario de Instagram válido." }, { status: 400 });
    }
  }

  const supabase = db();
  const { data: product } = await supabase
    .from("products")
    .select("id,title,price,sold")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return NextResponse.json({ error: "El producto no existe." }, { status: 404 });
  if (product.sold) return NextResponse.json({ error: "Este producto ya se vendió." }, { status: 409 });

  // Anti-spam simple: máx. 1 oferta por contacto y producto cada 60 s.
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("contact", contact)
    .gte("created_at", since);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "Ya enviaste una oferta hace poco. Espera un minuto 🙏" }, { status: 429 });
  }

  const { error } = await supabase.from("offers").insert({
    product_id: productId,
    amount,
    contact_type: contactType,
    contact,
    name,
    message,
  });
  if (error) {
    console.error("insert offer", error);
    return NextResponse.json({ error: "No se pudo guardar la oferta." }, { status: 500 });
  }

  await notifyOffer({
    productTitle: product.title,
    productPrice: Number(product.price),
    amount,
    contactType,
    contact,
    name,
    message,
  });

  return NextResponse.json({ ok: true });
}
