import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { CategoryIcon } from "./CategoryIcon";
import { api } from "@/lib/api";
import { dateInputValue, money, timeLabel } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";
import { Button, Empty, cx } from "./ui";

export function ExpenseList({
  items,
  categories,
  currency,
  onChanged,
}: {
  items: Expense[];
  categories: Category[];
  currency: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Expense | null>(null);

  if (items.length === 0) {
    return (
      <Empty
        title="Пока пусто"
        hint="Добавьте первый расход выше или напишите боту «кофе 350»"
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-line">
        {items.map((expense) => (
          <li key={expense.id}>
            <button
              onClick={() => setEditing(expense)}
              className="flex w-full min-w-0 items-center gap-3 rounded-xl px-2 py-3
                         text-left transition hover:bg-surface2 focus-visible:outline-2
                         focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <CategoryIcon category={expense.category} />

              <span className="block min-w-0 flex-1 overflow-hidden">
                {/* Тавсифи дароз бояд бурида шавад, вагарна сатр саҳифаро
                    аз экран васеътар мекунад */}
                <span className="block truncate text-sm font-medium">
                  {expense.description || expense.category.name}
                </span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: expense.category.color }}
                  />
                  <span className="min-w-0 truncate">
                    {expense.category.name}
                  </span>
                  <span aria-hidden className="shrink-0">
                    ·
                  </span>
                  <span className="shrink-0">
                    {timeLabel(expense.occurred_at)}
                  </span>
                </span>
              </span>

              <span className="tnum shrink-0 text-right text-sm font-semibold whitespace-nowrap">
                {money(expense.amount_base, currency)}
                {expense.currency !== currency && (
                  <span className="block text-xs font-normal text-muted">
                    {money(expense.amount, expense.currency)}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {editing && (
        <ExpenseDialog
          expense={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
    </>
  );
}

function ExpenseDialog({
  expense,
  categories,
  onClose,
  onSaved,
}: {
  expense: Expense;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(expense.amount);
  const [description, setDescription] = useState(expense.description);
  const [categoryId, setCategoryId] = useState(expense.category.id);
  const [occurredAt, setOccurredAt] = useState(
    dateInputValue(expense.occurred_at),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    setBusy(true);
    try {
      await api.updateExpense(expense.id, {
        amount,
        description,
        category_id: categoryId,
        occurred_at: new Date(occurredAt).toISOString(),
      });
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.deleteExpense(expense.id);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Расход"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl border border-line bg-surface
                   p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-pop
                   sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <CategoryIcon category={expense.category} size="sm" />
          <h2 className="text-base font-semibold tracking-tight">Расход</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="ml-auto grid size-9 place-items-center rounded-lg text-muted
                       transition hover:bg-surface2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Сумма">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className={inputClass}
            />
          </Field>

          <Field label="Описание">
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Категория">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Когда">
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="danger" onClick={remove} disabled={busy}>
            <Trash2 size={16} />
            Удалить
          </Button>
          <span className="flex-1" />
          <Button onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputClass = cx(
  "min-h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-base",
  "outline-none focus-visible:border-accent",
);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
