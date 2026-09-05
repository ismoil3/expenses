import { X } from "lucide-react";
import { useRef } from "react";

import { cx } from "./ui";

export interface Range {
  from: string; // YYYY-MM-DD, холӣ = маҳдудият нест
  to: string;
}

export const EMPTY_RANGE: Range = { from: "", to: "" };

function iso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shift(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return iso(date);
}

function monthStart(): string {
  const date = new Date();
  date.setDate(1);
  return iso(date);
}

const PRESETS: { label: string; range: () => Range }[] = [
  { label: "Сегодня", range: () => ({ from: iso(new Date()), to: "" }) },
  { label: "7 дней", range: () => ({ from: shift(6), to: "" }) },
  { label: "Этот месяц", range: () => ({ from: monthStart(), to: "" }) },
  { label: "30 дней", range: () => ({ from: shift(29), to: "" }) },
  { label: "Всё время", range: () => EMPTY_RANGE },
];

/** Ҳудуди сана ба ISO бо назардошти минтақаи вақти браузер.
 *  `to` то охири ҳамон рӯз мегирад, вагарна рӯзи охирин намеафтад. */
export function toQuery(range: Range): { from?: string; to?: string } {
  const query: { from?: string; to?: string } = {};
  if (range.from) query.from = new Date(`${range.from}T00:00:00`).toISOString();
  if (range.to) query.to = new Date(`${range.to}T23:59:59.999`).toISOString();
  return query;
}

function human(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

/** «1 — 5 сентября» ё «с 1 сентября» — то корбар бидонад, чиро мебинад. */
export function summary(range: Range): string {
  if (!range.from && !range.to) return "За всё время";
  if (range.from && range.to) return `${human(range.from)} — ${human(range.to)}`;
  if (range.from) return `С ${human(range.from)}`;
  return `По ${human(range.to)}`;
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      // Клик ба тамоми чорчӯба тақвимро мекушояд, на танҳо ба иконка
      onClick={() => input.current?.showPicker?.() ?? input.current?.focus()}
      className={cx(
        "relative flex min-h-10 min-w-0 flex-1 items-center gap-1.5 rounded-lg",
        "border border-line bg-bg px-2 text-left transition sm:gap-2 sm:px-2.5",
        "hover:border-accent/50 focus-within:border-accent",
        "focus-within:ring-2 focus-within:ring-accent-soft",
      )}
    >
      <span className="shrink-0 text-[11px] font-medium text-muted">{label}</span>
      <input
        ref={input}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={cx(
          "w-full min-w-0 bg-transparent text-[13px] outline-none",
          !value && "is-empty",
        )}
      />
    </button>
  );
}

/** Танҳо ду майдони сана — вақте пресетҳо аллакай дар ҷои дигаранд
 *  (масалан tab-ҳои «Обзор»). */
export function DateFields({
  value,
  onChange,
  className,
}: {
  value: Range;
  onChange: (range: Range) => void;
  className?: string;
}) {
  const isSet = Boolean(value.from || value.to);

  return (
    <div className={cx("flex min-w-0 items-center gap-1.5 sm:gap-2", className)}>
      <DateField
        label="с"
        value={value.from}
        max={value.to || undefined}
        onChange={(from) => onChange({ ...value, from })}
      />
      <DateField
        label="по"
        value={value.to}
        min={value.from || undefined}
        onChange={(to) => onChange({ ...value, to })}
      />
      {isSet && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_RANGE)}
          aria-label="Сбросить период"
          title={summary(value)}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted
                     transition hover:bg-surface2 hover:text-ink sm:size-10"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

export function DateRange({
  value,
  onChange,
}: {
  value: Range;
  onChange: (range: Range) => void;
}) {
  const active = PRESETS.find(
    (preset) =>
      preset.range().from === value.from && preset.range().to === value.to,
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Пресетҳо: дар телефон ба паҳлӯ ҳаракат мекунанд */}
      <div className="no-scrollbar -mx-0.5 flex gap-1.5 overflow-x-auto px-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.range())}
            className={cx(
              "min-h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition",
              active?.label === preset.label
                ? "border-accent bg-accent text-bg"
                : "border-line bg-surface text-muted hover:border-accent/40 hover:text-ink",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <DateFields value={value} onChange={onChange} />
    </div>
  );
}
