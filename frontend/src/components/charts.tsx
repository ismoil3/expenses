import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { dayLabel, dayTooltip, money, moneyShort } from "@/lib/format";
import type { CategorySlice, DayPoint } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { Dot } from "./ui";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "12px",
  color: "var(--ink)",
  fontSize: "13px",
  padding: "8px 10px",
  boxShadow: "var(--shadow-pop)",
} as const;

// Recharts сарлавҳа ва сатрҳои tooltip-ро худаш сиёҳ мекунад — дар мавзӯи
// торик хонда намешавад. Ранги онҳо бояд возеҳан гузошта шавад.
const TOOLTIP_LABEL = {
  color: "var(--muted)",
  fontSize: "11px",
  marginBottom: "2px",
} as const;

const TOOLTIP_ITEM = { color: "var(--ink)" } as const;

export function CategoryDonut({
  slices,
  currency,
}: {
  slices: CategorySlice[];
  currency: string;
}) {
  const data = slices.map((slice) => ({
    name: slice.category.name,
    category: slice.category,
    value: Number(slice.total),
    color: slice.category.color,
    share: slice.share,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const top = data[0];

  return (
    <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <div className="relative size-36 shrink-0 sm:size-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL}
              itemStyle={TOOLTIP_ITEM}
              formatter={(value: number, name) => [money(value, currency), name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Дар маркази ҳалқа — категорияи калонтарин */}
        {top && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <CategoryIcon category={top.category} size="sm" />
            <span className="tnum mt-1.5 text-sm font-semibold">
              {Math.round(top.share * 100)}%
            </span>
            <span className="mt-0.5 max-w-24 truncate text-[11px] text-muted">
              {top.name}
            </span>
          </div>
        )}
      </div>

      <ul className="flex w-full min-w-0 flex-1 flex-col gap-2.5">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-3 text-sm">
            <Dot color={entry.color} />
            <span className="min-w-0 flex-1 truncate">{entry.name}</span>

            {/* Хатти борик — фоизро бе хондани рақам нишон медиҳад */}
            <span
              aria-hidden
              className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full
                         bg-surface2 sm:block"
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(4, entry.share * 100)}%`,
                  background: entry.color,
                }}
              />
            </span>

            <span className="tnum shrink-0 text-right font-medium tabular-nums">
              {moneyShort(entry.value, currency)}
            </span>
          </li>
        ))}

        {data.length > 1 && (
          <li className="mt-1 flex items-center gap-3 border-t border-line pt-2.5 text-sm">
            <span className="flex-1 text-muted">Итого</span>
            <span className="tnum shrink-0 font-semibold">
              {moneyShort(total, currency)}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export function DailyBars({
  points,
  currency,
}: {
  points: DayPoint[];
  currency: string;
}) {
  const data = points.map((point) => ({
    day: point.day,
    label: dayLabel(point.day),
    value: Number(point.total),
  }));

  const peak = Math.max(...data.map((item) => item.value), 0);
  const spent = data.filter((item) => item.value > 0).length;

  return (
    <>
      <div className="h-44 w-full sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={14}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)", radius: 6 }}
              contentStyle={TOOLTIP_STYLE}
              labelStyle={TOOLTIP_LABEL}
              itemStyle={TOOLTIP_ITEM}
              labelFormatter={(_, payload) =>
                payload?.[0] ? dayTooltip(String(payload[0].payload.day)) : ""
              }
              formatter={(value: number) => [money(value, currency), "Расход"]}
            />
            <Bar dataKey="value" radius={[5, 5, 3, 3]} maxBarSize={30}>
              {data.map((item) => (
                <Cell
                  key={item.day}
                  // Рӯзи калонтарин таъкид мешавад — чашм фавран онро меёбад
                  fill={
                    item.value > 0 && item.value === peak
                      ? "var(--accent)"
                      : item.value > 0
                        ? "color-mix(in oklab, var(--accent) 35%, var(--surface-2))"
                        : "var(--surface-2)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted">
        <span>
          дней с тратами: <span className="tnum">{spent}</span> из {data.length}
        </span>
        <span className="tnum">максимум {moneyShort(peak, currency)}</span>
      </p>
    </>
  );
}
