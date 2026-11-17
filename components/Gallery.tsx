"use client";

import { useEffect, useRef, useState } from "react";

export default function Gallery({ images, alt, sold }: { images: string[]; alt: string; sold: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = track.current;
    if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((z) => (z === null ? z : Math.min(images.length - 1, z + 1)));
      if (e.key === "ArrowLeft") setZoom((z) => (z === null ? z : Math.max(0, z - 1)));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom, images.length]);

  if (!images.length) {
    return <div className="grid aspect-square place-items-center rounded-3xl bg-panel text-6xl">📦</div>;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-panel">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setZoom(i)}
              className="relative h-full w-full shrink-0 snap-center"
              aria-label={`Ver foto ${i + 1} en grande`}
            >
              <img
                src={src}
                alt={`${alt} — foto ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className={`h-full w-full object-cover ${sold ? "grayscale" : ""}`}
              />
            </button>
          ))}
        </div>

        {sold && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
            <span className="-rotate-12 rounded-xl border-4 border-white bg-red-600 px-6 py-2 text-3xl font-black tracking-widest text-white shadow-2xl">
              VENDIDO
            </span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              {idx + 1}/{images.length}
            </span>
            <NavBtn dir="left" hidden={idx === 0} onClick={() => go(idx - 1)} />
            <NavBtn dir="right" hidden={idx === images.length - 1} onClick={() => go(idx + 1)} />
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => go(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === idx ? "border-accent" : "border-transparent opacity-60"}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {zoom !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setZoom(null)}>
          <div className="flex items-center justify-between p-4 text-sm text-white/70">
            <span>{zoom + 1} / {images.length}</span>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl" aria-label="Cerrar">✕</button>
          </div>
          <div className="relative flex flex-1 items-center justify-center p-2">
            <img src={images[zoom]} alt={alt} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
            {zoom > 0 && (
              <NavBtn dir="left" onClick={(e) => { e.stopPropagation(); setZoom(zoom - 1); }} />
            )}
            {zoom < images.length - 1 && (
              <NavBtn dir="right" onClick={(e) => { e.stopPropagation(); setZoom(zoom + 1); }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ dir, hidden, onClick }: { dir: "left" | "right"; hidden?: boolean; onClick: (e: React.MouseEvent) => void }) {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Anterior" : "Siguiente"}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 sm:grid ${dir === "left" ? "left-3" : "right-3"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
