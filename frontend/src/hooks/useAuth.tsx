import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, ApiError, SESSION_LOST } from "@/lib/api";
import { isMiniApp, prepareMiniApp, webApp } from "@/lib/telegram";
import type { Me } from "@/lib/types";

type Status = "loading" | "authorized" | "anonymous";

interface AuthValue {
  status: Status;
  me: Me | null;
  setMe: (me: Me) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    try {
      setMe(await api.me());
      setStatus("authorized");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setMe(null);
        setStatus("anonymous");
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    prepareMiniApp();

    (async () => {
      // 1. Cookie аллакай ҳаст?
      try {
        setMe(await api.me());
        setStatus("authorized");
        return;
      } catch {
        /* нест — поёнтар мекӯшем */
      }

      // 2. Дар дохили Telegram кушода шуд — initData
      if (isMiniApp()) {
        try {
          setMe(await api.loginWithMiniApp(webApp()!.initData));
          setStatus("authorized");
          return;
        } catch {
          /* имзо нагузашт */
        }
      }

      setStatus("anonymous");
    })();
  }, []);

  // Cookie кӯҳна шуд ё нест — ба ҷои спиннери абадӣ саҳифаи вуруд
  useEffect(() => {
    const onLost = () => {
      setMe(null);
      setStatus("anonymous");
    };
    window.addEventListener(SESSION_LOST, onLost);
    return () => window.removeEventListener(SESSION_LOST, onLost);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setMe(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      me,
      setMe: (next: Me) => {
        setMe(next);
        setStatus("authorized");
      },
      signOut,
      refresh,
    }),
    [status, me, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth бояд дар дохили AuthProvider бошад");
  return value;
}
