import { ChartPie, Receipt, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { cx } from "./ui";

const LINKS = [
  { to: "/", label: "Обзор", Icon: ChartPie, end: true },
  { to: "/expenses", label: "Расходы", Icon: Receipt, end: false },
  { to: "/settings", label: "Настройки", Icon: Settings, end: false },
];

function Brand({ compact = false }: { compact?: boolean }) {
  const { me } = useAuth();
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent
                   text-base font-bold text-bg"
      >
        A
      </span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight">Amiri</p>
        {!compact && (
          <p className="truncate text-xs text-muted">
            {me?.first_name ?? "Расходы"} · {me?.base_currency}
          </p>
        )}
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <div className="min-h-dvh lg:flex">
      {/* Компютер: сайдбари доимӣ */}
      <aside
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r
                   border-line bg-surface px-4 py-6 lg:flex"
      >
        <Brand />

        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-muted hover:bg-surface2 hover:text-ink",
                )
              }
            >
              <link.Icon size={18} strokeWidth={2} aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <p className="mt-auto text-xs leading-relaxed text-muted">
          Расходы приходят из бота в Telegram — здесь их видно и можно поправить.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Телефон ва планшет: сарлавҳаи болоӣ */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b
                     border-line bg-bg/85 px-4 py-3 backdrop-blur lg:hidden"
        >
          <Brand />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-28 sm:px-6 lg:pt-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Телефон: навигатсия дар поён — ангушт ба он мерасад */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95
                   pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-md">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cx(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
                  isActive ? "font-medium text-accent" : "text-muted",
                )
              }
            >
              <link.Icon size={20} strokeWidth={2} aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
