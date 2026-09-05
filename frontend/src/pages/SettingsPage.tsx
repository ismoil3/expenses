import { LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CategoryIcon } from "@/components/CategoryIcon";
import { LimitsCard } from "@/components/LimitsCard";
import { Button, Card, Spinner } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { api, sessionExpiresAt } from "@/lib/api";
import type { Category } from "@/lib/types";

const LANGS = [
  { value: "tg", label: "Тоҷикӣ" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const CURRENCIES = ["TJS", "USD", "RUB"];

export function SettingsPage() {
  const { me, setMe, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [busy, setBusy] = useState(false);
  const expiresAt = sessionExpiresAt();

  useEffect(() => {
    api.categories().then(setCategories);
  }, []);

  async function patch(change: { lang?: string; base_currency?: string }) {
    setBusy(true);
    try {
      setMe(await api.updateMe(change));
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: number) {
    await api.deleteCategory(id);
    setCategories(await api.categories());
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 lg:max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Настройки
      </h1>

      <Card>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Язык</h2>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((lang) => (
            <Button
              key={lang.value}
              variant={me?.lang === lang.value ? "primary" : "ghost"}
              disabled={busy}
              onClick={() => patch({ lang: lang.value })}
            >
              {lang.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold tracking-tight">Основная валюта</h2>
        <p className="mb-3 text-xs text-muted">
          В ней считаются все итоги. Прошлые расходы не пересчитываются —
          курс сохраняется на момент записи.
        </p>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((code) => (
            <Button
              key={code}
              variant={me?.base_currency === code ? "primary" : "ghost"}
              disabled={busy}
              onClick={() => patch({ base_currency: code })}
            >
              {code}
            </Button>
          ))}
        </div>
      </Card>

      {categories && <LimitsCard categories={categories} />}

      <Card>
        <h2 className="mb-1 text-sm font-semibold tracking-tight">Категории</h2>
        <p className="mb-3 text-xs text-muted">
          Свои категории создаёт бот, когда встречает незнакомый расход.
          При удалении расходы переносятся в «Другое».
        </p>

        {categories === null ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-1">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-lg px-1 py-2"
              >
                <CategoryIcon category={category} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {category.name}
                </span>
                {category.is_system ? (
                  <span className="text-xs text-muted">системная</span>
                ) : (
                  <button
                    onClick={() => removeCategory(category.id)}
                    aria-label={`Удалить категорию ${category.name}`}
                    className="grid size-8 place-items-center rounded-lg text-muted
                               transition hover:bg-surface2 hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Сессия</h2>
        <p className="text-xs text-muted">
          Telegram: {me?.username ? `@${me.username}` : me?.tg_id}
        </p>
        <p className="mb-3 text-xs text-muted">
          Вход действует до{" "}
          {expiresAt
            ? new Date(expiresAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "закрытия браузера"}
        </p>
        <Button onClick={signOut}>
          <LogOut size={16} />
          Выйти
        </Button>
      </Card>
    </div>
  );
}
