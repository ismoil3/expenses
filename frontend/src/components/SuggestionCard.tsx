import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { api } from "@/lib/api";
import type { Suggestion } from "@/lib/types";
import { Button } from "./ui";

/** «зоопарк» ба ягон категория мувофиқ наомад — AI навашро пешниҳод мекунад.
 *  Ҳамон мантиқи тугмаҳои бот, вале дар панел. */
export function SuggestionCard({
  expenseId,
  suggestion,
  onResolved,
}: {
  expenseId: number;
  suggestion: Suggestion;
  onResolved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  async function decide(accept: boolean) {
    setBusy(true);
    try {
      await api.resolveSuggestion(expenseId, accept);
      setDone(accept ? "accepted" : "declined");
      onResolved();
    } catch {
      setDone("declined");
    } finally {
      setBusy(false);
    }
  }

  if (done === "accepted") {
    return (
      <p className="rise flex items-center gap-2 text-sm text-muted">
        <Check size={15} className="text-down" aria-hidden />
        Категория «{suggestion.name}» создана
      </p>
    );
  }

  if (done === "declined") {
    return (
      <p className="rise text-sm text-muted">
        Оставили в «Другое» — больше не спросим про «{suggestion.phrase}»
      </p>
    );
  }

  return (
    <div className="rise rounded-xl border border-accent/40 bg-accent-soft/60 p-3.5">
      <p className="flex items-start gap-2 text-sm">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <span>
          «{suggestion.phrase}» не подошло ни к одной категории.
          Создать <b>{suggestion.name}</b>?
        </span>
      </p>

      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          className="min-h-10"
          disabled={busy}
          onClick={() => decide(true)}
        >
          <Check size={16} aria-hidden />
          Создать
        </Button>
        <Button className="min-h-10" disabled={busy} onClick={() => decide(false)}>
          <X size={16} aria-hidden />
          Не нужно
        </Button>
      </div>
    </div>
  );
}
