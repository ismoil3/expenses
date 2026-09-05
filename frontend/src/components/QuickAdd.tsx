import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { ExpenseCreated } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { SuggestionCard } from "./SuggestionCard";
import { Button } from "./ui";

/** Ҳамон сатре, ки дар бот кор мекунад — «кофе 350». */
export function QuickAdd({ onAdded }: { onAdded: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<ExpenseCreated[]>([]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() || busy) return;

    setBusy(true);
    setError(null);
    try {
      const created = await api.addByText(text.trim());
      setSaved(created);
      setText("");
      onAdded();

      // Агар AI категорияи нав пешниҳод кунад, ҷавоби корбар лозим аст —
      // чунин паём худаш пинҳон намешавад
      if (!created.some((expense) => expense.suggestion)) {
        window.setTimeout(() => setSaved([]), 5000);
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Не удалось сохранить",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="кофе 350"
          aria-label="Новый расход"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-bg px-4
                     text-base outline-none transition placeholder:text-muted
                     focus-visible:border-accent
                     focus-visible:ring-4 focus-visible:ring-accent-soft"
        />
        <Button
          type="submit"
          variant="primary"
          className="min-h-12 px-5"
          disabled={busy || !text.trim()}
        >
          <Plus size={17} aria-hidden />
          <span className="hidden sm:inline">
            {busy ? "Сохраняю…" : "Добавить"}
          </span>
        </Button>
      </div>

      {saved.length > 0 && (
        <div className="rise flex flex-col gap-1.5">
          {saved.length > 1 && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Check size={14} className="text-down" aria-hidden />
              Записано расходов: <span className="tnum">{saved.length}</span>
            </p>
          )}
          {saved.map((expense) => (
            <div key={expense.id} className="flex min-w-0 flex-col gap-2">
              <p className="flex min-w-0 items-center gap-2 text-sm">
                {saved.length === 1 && (
                  <Check size={16} className="text-down" aria-hidden />
                )}
                <CategoryIcon category={expense.category} size="sm" />
                <span className="tnum shrink-0 font-medium">
                  {money(expense.amount, expense.currency)}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted">
                  {expense.description || expense.category.name}
                </span>
              </p>

              {expense.suggestion && (
                <SuggestionCard
                  expenseId={expense.id}
                  suggestion={expense.suggestion}
                  onResolved={onAdded}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
