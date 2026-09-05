import { useCallback, useEffect, useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

import { CategoryDonut, DailyBars } from "@/components/charts";
import {
  DateFields,
  EMPTY_RANGE,
  summary as rangeLabel,
  toQuery,
  type Range,
} from "@/components/DateRange";
import { ExpenseList } from "@/components/ExpenseList";
import { QuickAdd } from "@/components/QuickAdd";
import { Card, cx, Empty, SectionTitle, Skeleton, Tabs } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { api, type StatsScope } from "@/lib/api";
import { money } from "@/lib/format";
import type {
  Category,
  CategorySlice,
  DayPoint,
  Expense,
  Period,
  Summary,
} from "@/lib/types";

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Сегодня" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
];

export function Dashboard() {
  const { me } = useAuth();
  // Талаботи ҳакатон: ҳадди ақал моҳи ҷорӣ — барои ҳамин пешфарз «моҳ»
  const [period, setPeriod] = useState<Period>("month");
  const [range, setRange] = useState<Range>(EMPTY_RANGE);
  const [loading, setLoading] = useState(true);

  // Санаи интихобшуда давраи тайёрро иваз мекунад — tab-и алоҳида лозим нест
  const custom = Boolean(range.from || range.to);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [slices, setSlices] = useState<CategorySlice[]>([]);
  const [days, setDays] = useState<DayPoint[]>([]);
  const [recent, setRecent] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    const window = Boolean(range.from || range.to);
    const scope: StatsScope = window ? toQuery(range) : { period };

    try {
      const [nextSummary, nextSlices, nextDays, nextRecent, nextCategories] =
        await Promise.all([
          api.summary(scope),
          api.byCategory(scope),
          api.byDay(scope),
          api.expenses({ limit: 6, ...(window ? toQuery(range) : {}) }),
          api.categories(),
        ]);

      setSummary(nextSummary);
      setSlices(nextSlices);
      setDays(nextDays);
      setRecent(nextRecent.items);
      setCategories(nextCategories);
    } finally {
      // Ҳатто ҳангоми хато скелет бояд қатъ шавад
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.from, range.to]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const currency = me?.base_currency ?? "TJS";
  const periodLabel = custom
    ? rangeLabel(range)
    : (PERIODS.find((item) => item.value === period)?.label ?? "");

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Обзор</h1>

        {/* Санаҳо дар ҳамон сатри tab-ҳо. Интихоби сана tab-ро хомӯш
            мекунад, пахши tab санаҳоро пок мекунад — ҳамеша як манбаъ.
            То 768px ду сатр мешаванд, вагарна дар планшет фишурда мешуданд. */}
        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
          <Tabs
            value={custom ? "" : period}
            options={PERIODS}
            onChange={(next) => {
              setRange(EMPTY_RANGE);
              setPeriod(next);
            }}
          />
          <DateFields value={range} onChange={setRange} />
        </div>
      </div>

      <Card>
        <QuickAdd onAdded={load} />
      </Card>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 rise sm:gap-5 lg:grid-cols-12">
          {/* Ҷамъи давра — рақами асосии саҳифа */}
          <Card className="p-5 sm:p-6 lg:col-span-4">
            <p className="truncate text-xs font-medium tracking-wide text-muted uppercase">
              {periodLabel}
            </p>
            {/* Суммаи калон дар 375px аз чорчӯба намебарояд */}
            <p className="tnum mt-2 text-3xl font-semibold tracking-tight wrap-break-word sm:text-4xl">
              {money(summary?.total ?? 0, currency)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <span className="tnum">{summary?.count ?? 0} расходов</span>
              {summary?.change_percent != null && (
                <>
                  <span aria-hidden>·</span>
                  <span
                    className={cx(
                      "inline-flex items-center gap-1",
                      summary.change_percent > 0 ? "text-up" : "text-down",
                    )}
                  >
                    {summary.change_percent > 0 ? (
                      <TrendingUp size={14} aria-hidden />
                    ) : (
                      <TrendingDown size={14} aria-hidden />
                    )}
                    <span className="tnum">
                      {Math.abs(summary.change_percent)}%
                    </span>
                  </span>
                  <span>к прошлому периоду</span>
                </>
              )}
            </div>

            {summary?.previous_total && Number(summary.previous_total) > 0 && (
              <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
                Прошлый период:{" "}
                <span className="tnum">
                  {money(summary.previous_total, currency)}
                </span>
              </p>
            )}
          </Card>

          <Card className="p-4 sm:p-5 lg:col-span-8">
            <SectionTitle aside={periodLabel}>По категориям</SectionTitle>
            {slices.length ? (
              <CategoryDonut slices={slices} currency={currency} />
            ) : (
              <Empty
                title="Пока нет расходов"
                hint="Добавьте первый выше или напишите боту «кофе 350»"
              />
            )}
          </Card>

          <Card className="p-4 sm:p-5 lg:col-span-12">
            <SectionTitle aside={periodLabel}>По дням</SectionTitle>
            <DailyBars points={days} currency={currency} />
          </Card>

          <Card className="p-0 lg:col-span-12">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-semibold tracking-tight">
                Последние расходы
              </h2>
              <Link
                to="/expenses"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition hover:text-ink"
              >
                Все <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
            <div className="px-3 sm:px-4">
              <ExpenseList
                items={recent}
                categories={categories}
                currency={currency}
                onChanged={load}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
      <Card className="p-5 sm:p-6 lg:col-span-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-9 w-40" />
        <Skeleton className="mt-3 h-3 w-28" />
      </Card>
      <Card className="p-4 sm:p-5 lg:col-span-8">
        <Skeleton className="h-3 w-28" />
        <div className="mt-4 flex items-center gap-6">
          <Skeleton className="size-40 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2.5">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </Card>
      <Card className="p-4 sm:p-5 lg:col-span-12">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-40 w-full" />
      </Card>
    </div>
  );
}
