const SIGNS: Record<string, string> = { TJS: "c.", USD: "$", RUB: "₽" };

export function sign(currency: string): string {
  return SIGNS[currency] ?? currency;
}

/** `350` → `350 c.` · `12.5` → `12.50 c.` — тини танҳо ҳангоми зарурат. */
export function money(amount: string | number, currency: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `— ${sign(currency)}`;

  const hasCents = Math.round(value * 100) % 100 !== 0;
  const text = value.toLocaleString("ru-RU", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${text} ${sign(currency)}`;
}

/** Бе тини — барои сарлавҳаҳо ва меҳварҳо. */
export function moneyShort(amount: string | number, currency: string): string {
  const value = Math.round(Number(amount) || 0);
  return `${value.toLocaleString("ru-RU")} ${sign(currency)}`;
}

export function compact(amount: string | number): string {
  const value = Number(amount) || 0;
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}к`;
  }
  return String(Math.round(value));
}

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return String(date.getDate());
}

export function dayTooltip(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return `${WEEKDAYS[date.getDay()]}, ${date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  })}`;
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
