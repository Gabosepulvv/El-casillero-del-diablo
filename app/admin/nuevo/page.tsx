import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ProductForm from "@/components/admin/ProductForm";
import { isAdmin } from "@/lib/auth";
import { getProducts } from "@/lib/supabase";
import { DEFAULT_CATEGORIES } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo producto", robots: { index: false } };

export default async function NewProduct() {
  if (!(await isAdmin())) redirect("/admin");
  const products = await getProducts();
  const categories = [...new Set([...products.map((p) => p.category), ...DEFAULT_CATEGORIES])];
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-3xl px-4 pt-5">
        <h1 className="mb-5 text-2xl font-bold">Nuevo producto</h1>
        <ProductForm categories={categories} />
      </main>
    </>
  );
}
