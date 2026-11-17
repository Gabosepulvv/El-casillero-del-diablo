import Link from "next/link";
import { INSTAGRAM, STORE_NAME } from "@/lib/config";

export default function Header({ back = false }: { back?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {back && (
          <Link
            href="/"
            aria-label="Volver"
            className="-ml-1 grid h-9 w-9 place-items-center rounded-full hover:bg-panel-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
        )}
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
          <span
            className="truncate text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-grotesk)" }}
          >
            {STORE_NAME}
          </span>
        </Link>
        {INSTAGRAM && (
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            <span className="hidden sm:inline">@{INSTAGRAM}</span>
          </a>
        )}
      </div>
    </header>
  );
}
