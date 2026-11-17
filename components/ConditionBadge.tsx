import { conditionColor, conditionLabel } from "@/lib/format";

export function ConditionPill({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${conditionColor(value)}`} />
      {value}/10
    </span>
  );
}

export function ConditionMeter({ value }: { value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label !mb-0">Estado</span>
        <span className="text-sm">
          <b className="text-lg">{value}</b>
          <span className="text-muted">/10 · {conditionLabel(value)}</span>
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full ${i < value ? conditionColor(value) : "bg-panel-2"}`}
          />
        ))}
      </div>
    </div>
  );
}
