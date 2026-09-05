import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { Button, Spinner } from "@/components/ui";

/** `/auth?token=…` — линки яккарата аз команди `/panel`. */
export function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setMe } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const used = useRef(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    // React StrictMode эффектро ду бор мебарорад, вале токен яккарата аст
    if (used.current) return;
    used.current = true;

    api
      .loginWithToken(token)
      .then((me) => {
        setMe(me);
        navigate("/", { replace: true });
      })
      .catch((caught) => {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Не удалось войти",
        );
      });
  }, [params, navigate, setMe]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6 text-center">
        <p className="text-base font-medium">Ссылка не подошла</p>
        <p className="text-sm text-muted">{error}</p>
        <p className="text-sm text-muted">
          Отправьте боту <code className="text-ink">/panel</code> ещё раз —
          ссылка живёт 5 минут и открывается один раз.
        </p>
        <Button onClick={() => navigate("/login", { replace: true })}>
          Понятно
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner label="Входим…" />
    </div>
  );
}
