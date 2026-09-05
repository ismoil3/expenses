import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DateRange, EMPTY_RANGE, toQuery, type Range } from "@/components/DateRange";
import { ExpenseList } from "@/components/ExpenseList";
import { Button, Card, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";

const PAGE = 30;

export function ExpensesPage() {
  const { me } = useAuth();
  const [items, setItems] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [range, setRange] = useState<Range>(EMPTY_RANGE);

  const [total, setTotal] = useState(0);
  const [sum, setSum] = useState("0");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const load = useCallback(
    async (offset = 0) => {
      try {
        const [list, cats] = await Promise.all([
          api.expenses({
            limit: PAGE,
            offset,
            category_id: categoryId,
            ...toQuery(range),
          }),
          api.categories(),
        ]);
        setItems((previous) =>
          offset === 0 ? list.items : [...previous, ...list.items],
        );
        setTotal(list.total);
        setSum(list.sum);
        setCategories(cats);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, range],
  );

  useEffect(() => {
    setLoading(true);
    load(0);
  }, [load]);

  async function download() {
    setDownloading(true);
    setCsvError(null);
    try {
      await api.downloadCsv(toQuery(range));
    } catch {
      setCsvError("Не удалось выгрузить CSV. Попробуйте войти заново.");
    } finally {
      setDownloading(false);
    }
  }

  const currency = me?.base_currency ?? "TJS";

  return (
    <div className="flex flex-col gap-3">
      {/* Ҷамъ дар худи сарлавҳа — як корточкаи алоҳида лозим нест */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Расходы
          </h1>
          <p className="tnum text-xs text-muted">
            {loading ? "…" : `${total} за период`}
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-8 w-24 sm:w-28" />
        ) : (
          <p className="tnum shrink-0 text-xl font-semibold tracking-tight sm:text-2xl">
            {money(sum, currency)}
          </p>
        )}
      </div>

      <Card className="flex flex-col gap-2 p-3 sm:p-3.5">
        <DateRange value={range} onChange={setRange} />

        <div className="flex gap-2">
          <select
            value={categoryId ?? ""}
            onChange={(event) =>
              setCategoryId(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-line bg-bg
                       px-2.5 text-[13px] outline-none transition
                       focus-visible:border-accent focus-visible:ring-2
                       focus-visible:ring-accent-soft"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <Button
            onClick={download}
            disabled={downloading || total === 0}
            className="min-h-10 px-3 text-xs"
          >
            <Download size={15} aria-hidden />
            {downloading ? "…" : "CSV"}
          </Button>
        </div>
      </Card>

      {csvError && <p className="text-sm text-danger">{csvError}</p>}

      <Card className="p-0">
        <div className="px-3 sm:px-4">
          {loading ? (
            <div className="flex flex-col gap-2.5 py-3">
              {[0, 1, 2, 3, 4].map((row) => (
                <Skeleton key={row} className="h-11 w-full" />
              ))}
            </div>
          ) : (
            <ExpenseList
              items={items}
              categories={categories}
              currency={currency}
              onChanged={() => load(0)}
            />
          )}
        </div>
      </Card>

      {!loading && items.length < total && (
        <Button onClick={() => load(items.length)}>Показать ещё</Button>
      )}
    </div>
  );
}
