import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { money, moneyShort } from "@/lib/format";
import type { Category, Limit } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { Button, Card, Skeleton, cx } from "./ui";

/** Ранги ҳолат: сабз → зард → сурх, ҳамон зинаҳое, ки бот огоҳ мекунад. */
function tone(share: number): string {
  if (share >= 1) return "var(--danger)";
  if (share >= 0.8) return "#C9A227";
  return "var(--accent)";
}

export function LimitsCard({ categories }: { categories: Category[] }) {
  const [limits, setLimits] = useState<Limit[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.limits().then(setLimits);
  }, []);

  const free = categories.filter(
    (category) => !limits?.some((limit) => limit.category.id === category.id),
  );

  async function save() {
    if (!categoryId || !amount) return;
    setBusy(true);
    try {
      setLimits(await api.setLimit(Number(categoryId), amount));
      setCategoryId("");
      setAmount("");
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    await api.removeLimit(id);
    setLimits(await api.limits());
  }

  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold tracking-tight">
        Лимиты на месяц
      </h2>
      <p className="mb-3 text-xs text-muted">
        Бот предупредит в Telegram, когда потратите 80% и когда лимит будет
        превышен.
      </p>

      {limits === null ? (
        <Skeleton className="h-16 w-full" />
      ) : limits.length === 0 && !adding ? (
        <p className="mb-3 text-sm text-muted">Пока не заданы.</p>
      ) : (
        <ul className="mb-3 flex flex-col gap-3">
          {limits.map((limit) => (
            <li key={limit.category.id} className="flex items-center gap-3">
              <CategoryIcon category={limit.category} size="sm" />

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm">
                    {limit.category.name}
                  </span>
                  <span className="tnum shrink-0 text-xs text-muted">
                    {moneyShort(limit.spent, limit.currency)} /{" "}
                    {money(limit.amount, limit.currency)}
                  </span>
                </span>

                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface2">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{
                      width: `${Math.min(100, Math.max(3, limit.share * 100))}%`,
                      background: tone(limit.share),
                    }}
                  />
                </span>
              </span>

              <button
                onClick={() => remove(limit.category.id)}
                aria-label={`Снять лимит с «${limit.category.name}»`}
                className="grid size-8 shrink-0 place-items-center rounded-lg
                           text-muted transition hover:bg-surface2 hover:text-danger"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={cx(inputClass, "flex-1")}
            >
              <option value="">Категория</option>
              {free.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="1000"
              aria-label="Сумма лимита"
              className={cx(inputClass, "w-28")}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="min-h-10"
              disabled={busy || !categoryId || !amount}
              onClick={save}
            >
              Сохранить
            </Button>
            <Button className="min-h-10" onClick={() => setAdding(false)}>
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        free.length > 0 && (
          <Button className="min-h-10" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden />
            Поставить лимит
          </Button>
        )
      )}
    </Card>
  );
}

const inputClass = cx(
  "min-h-10 min-w-0 rounded-lg border border-line bg-bg px-2.5 text-sm",
  "outline-none transition focus-visible:border-accent",
  "focus-visible:ring-2 focus-visible:ring-accent-soft",
);
