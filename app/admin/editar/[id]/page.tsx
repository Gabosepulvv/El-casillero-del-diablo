import { notFound, redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { isAdmin } from "@/lib/auth";
import { getProduct, getProducts } from "@/lib/supabase";
import { DEFAULT_CATEGORIES } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar producto", robots: { index: false } };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const [product, products] = await Promise.all([getProduct(id), getProducts()]);
  if (!product) notFound();
  const categories = [...new Set([...products.map((p) => p.category), ...DEFAULT_CATEGORIES])];
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-4 pt-5">
        <h1 className="mb-5 text-2xl font-bold">Editar producto</h1>
        <ProductForm product={product} categories={categories} />
      </main>
    </>
  );
}
