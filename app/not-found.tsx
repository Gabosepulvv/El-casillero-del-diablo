import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-6xl">👻</div>
        <h1 className="mt-4 text-2xl font-bold">No encontramos esto</h1>
        <p className="mt-2 text-muted">Puede que el producto haya sido eliminado.</p>
        <Link href="/" className="btn btn-primary mt-6">Ver productos</Link>
      </main>
    </>
  );
}
