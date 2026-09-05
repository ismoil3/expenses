const BOT = import.meta.env.VITE_BOT_USERNAME ?? "amiri_expenses_bot";

const STEPS = [
  { n: "1", text: "Откройте бота" },
  { n: "2", text: "Отправьте команду /panel" },
  { n: "3", text: "Нажмите на ссылку из ответа" },
];

export function Login() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="rise w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-2xl bg-accent
                       text-lg font-bold text-bg"
          >
            A
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Amiri</h1>
            <p className="text-sm text-muted">Трекер расходов в Telegram</p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <p className="text-sm font-medium">
            Вход через бота — ни регистрации, ни пароля
          </p>

          <ol className="mt-4 flex flex-col gap-3">
            {STEPS.map((step) => (
              <li key={step.n} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-full
                             bg-accent-soft text-xs font-semibold text-accent"
                >
                  {step.n}
                </span>
                <span className="text-muted">{step.text}</span>
              </li>
            ))}
          </ol>

          <a
            href={`https://t.me/${BOT}?start=panel`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex min-h-12 items-center justify-center rounded-xl
                       bg-accent px-4 text-sm font-medium text-bg transition
                       hover:brightness-110 focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Открыть @{BOT}
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Ссылка входа живёт 5 минут и открывается один раз.
        </p>
      </div>
    </div>
  );
}
