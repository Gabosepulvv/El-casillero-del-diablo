import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <img src="/icon.svg" alt="" width={26} height={26} />
          Panel
        </Link>
        <Link href="/" target="_blank" className="ml-auto rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg">
          Ver tienda ↗
        </Link>
        <form action={logout}>
          <button className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg">Salir</button>
        </form>
      </div>
    </header>
  );
}
