import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        // `min-w-0` ҳатмист: бе он фарзанди grid/flex паҳноии мазмунро
        // мегирад ва графикҳо саҳифаро аз экран васеътар мекунанд
        "min-w-0 rounded-2xl border border-line bg-surface shadow-card",
        className ?? "p-4 sm:p-5",
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="shrink-0 text-sm font-semibold tracking-tight">{children}</h2>
      {/* Фосилаи дароз («1 — 5 сентября») сарлавҳаро намешиканад */}
      {aside && (
        <span className="min-w-0 truncate text-xs text-muted">{aside}</span>
      )}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "quiet";
};

export function Button({ variant = "ghost", className, ...props }: ButtonProps) {
  const styles = {
    primary: "bg-accent text-bg hover:brightness-110 active:brightness-95",
    ghost: "border border-line bg-surface hover:bg-surface2",
    danger: "border border-line text-danger hover:bg-surface2",
    quiet: "text-muted hover:bg-surface2 hover:text-ink",
  }[variant];

  return (
    <button
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4",
        "text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  /** Метавонад ба ҳеҷ як мувофиқ наояд — он гоҳ ҳеҷ tab фаъол нест */
  value: string;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex w-full gap-1 rounded-xl border border-line bg-surface p-1
                 shadow-card sm:w-auto"
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cx(
            "min-h-9 flex-1 rounded-lg px-4 text-sm font-medium transition sm:flex-none",
            value === option.value
              ? "bg-accent text-bg shadow-sm"
              : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-xl", className)} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted">
      <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full"
      style={{ background: color }}
    />
  );
}
