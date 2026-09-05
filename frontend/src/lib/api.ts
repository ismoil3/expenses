import type {
  Category,
  CategorySlice,
  DayPoint,
  Expense,
  ExpenseCreated,
  ExpenseList,
  Limit,
  Login,
  Me,
  Period,
  Summary,
} from "./types";

/** Дар dev Vite `/api`-ро ба backend мегузаронад, барои ҳамин origin як аст. */
const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Сессия аз байн рафт — панел бояд ба саҳифаи вуруд барад,
 *  на дар спиннер бимонад. */
export const SESSION_LOST = "amiri:session-lost";

// --- сессияи захиравӣ ------------------------------------------------------
// Роҳи асосӣ cookie-и httpOnly аст. Вале агар браузер онро нагузорад
// (танзимоти қатъӣ, васеъкунӣ, реҷаи пинҳонӣ), панел бе он кор намекунад —
// барои ҳамин ҳамон токен бо мӯҳлати худаш дар браузер нигоҳ дошта мешавад.
const STORE_KEY = "amiri.session";

interface StoredSession {
  token: string;
  expiresAt: number;
}

function readStored(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function storeSession(token: string, days: number): void {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        token,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
      } satisfies StoredSession),
    );
  } catch {
    /* хотира дастрас нест — cookie кор мекунад */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* фарқ надорад */
  }
}

export function sessionExpiresAt(): number | null {
  return readStored()?.expiresAt ?? null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const stored = readStored();

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include", // cookie-и сессия — роҳи асосӣ
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(stored ? { Authorization: `Bearer ${stored.token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* ҷавоб JSON нест — матни статусро мемонем */
    }

    // `/auth/*` худаш хатоҳоро нишон медиҳад — онро огоҳ намекунем
    if (response.status === 401 && !path.startsWith("/api/auth/")) {
      clearSession();
      window.dispatchEvent(new CustomEvent(SESSION_LOST));
    }

    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** Ҳудуди ҳисобот: ё давраи тайёр, ё фосилаи санаҳо. */
export type StatsScope =
  | { period: Period }
  | { from?: string; to?: string };

function statsQuery(scope: StatsScope): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(scope)) {
    if (value) query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

/** Сессияро дар браузер нигоҳ медорад ва профилро бармегардонад. */
async function login(path: string, body: unknown): Promise<Me> {
  const session = await request<Login>(path, { method: "POST", ...json(body) });
  storeSession(session.session_token, session.expires_in_days);
  const { session_token: _token, expires_in_days: _days, ...me } = session;
  return me;
}

export const api = {
  // --- вуруд ---
  loginWithToken: (token: string) => login("/api/auth/telegram-token", { token }),

  loginWithMiniApp: (initData: string) =>
    login("/api/auth/miniapp", { init_data: initData }),

  logout: async () => {
    clearSession();
    await request<void>("/api/auth/logout", { method: "POST" });
  },

  // --- профил ---
  me: () => request<Me>("/api/me"),

  updateMe: (patch: Partial<Pick<Me, "lang" | "base_currency">>) =>
    request<Me>("/api/me", { method: "PATCH", ...json(patch) }),

  // --- категорияҳо ---
  categories: () => request<Category[]>("/api/categories"),

  createCategory: (name: string, emoji: string) =>
    request<Category>("/api/categories", { method: "POST", ...json({ name, emoji }) }),

  deleteCategory: (id: number) =>
    request<void>(`/api/categories/${id}`, { method: "DELETE" }),

  // --- лимитҳо ---
  limits: () => request<Limit[]>("/api/limits"),

  setLimit: (categoryId: number, amount: string) =>
    request<Limit[]>("/api/limits", {
      method: "PUT",
      ...json({ category_id: categoryId, amount }),
    }),

  removeLimit: (categoryId: number) =>
    request<void>(`/api/limits/${categoryId}`, { method: "DELETE" }),

  // --- харҷҳо ---
  expenses: (params: {
    from?: string;
    to?: string;
    category_id?: number;
    limit?: number;
    offset?: number;
  } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) query.set(key, String(value));
    }
    const suffix = query.toString();
    return request<ExpenseList>(`/api/expenses${suffix ? `?${suffix}` : ""}`);
  },

  /** Як сатр метавонад чанд харҷ бошад: «кофе 350, такси 900, нон 20». */
  addByText: (text: string) =>
    request<ExpenseCreated[]>("/api/expenses", {
      method: "POST",
      ...json({ text }),
    }),

  /** Ҷавоб ба пешниҳоди категорияи нави AI. */
  resolveSuggestion: (id: number, accept: boolean) =>
    request<Expense>(`/api/expenses/${id}/suggestion`, {
      method: "POST",
      ...json({ accept }),
    }),

  updateExpense: (
    id: number,
    patch: {
      amount?: string;
      currency?: string;
      category_id?: number;
      description?: string;
      occurred_at?: string;
    },
  ) => request<Expense>(`/api/expenses/${id}`, { method: "PATCH", ...json(patch) }),

  deleteExpense: (id: number) =>
    request<void>(`/api/expenses/${id}`, { method: "DELETE" }),

  // --- ҳисоботҳо ---
  // Ё давраи тайёр, ё фосилаи дилхоҳ — ҳамон се endpoint
  summary: (scope: StatsScope) =>
    request<Summary>(`/api/stats/summary${statsQuery(scope)}`),

  byCategory: (scope: StatsScope) =>
    request<CategorySlice[]>(`/api/stats/by-category${statsQuery(scope)}`),

  byDay: (scope: StatsScope) =>
    request<DayPoint[]>(`/api/stats/by-day${statsQuery(scope)}`),

  /** CSV-ро мекашад ва ҳамчун файл нигоҳ медорад.
   *
   * Тугмаи оддии `<a href>` кор намекунад: навигатсия сарлавҳаи
   * `Authorization`-ро намефиристад, танҳо cookie. Барои ҳамин файл
   * тавассути `fetch` гирифта, ба blob табдил дода мешавад.
   */
  downloadCsv: async (params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    const suffix = query.toString();

    const stored = readStored();
    const response = await fetch(
      `${BASE}/api/export.csv${suffix ? `?${suffix}` : ""}`,
      {
        credentials: "include",
        headers: stored ? { Authorization: `Bearer ${stored.token}` } : {},
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
        window.dispatchEvent(new CustomEvent(SESSION_LOST));
      }
      throw new ApiError(response.status, "Не удалось выгрузить CSV");
    }

    const disposition = response.headers.get("content-disposition") ?? "";
    const match = /filename="?([^";]+)"?/.exec(disposition);
    const filename = match?.[1] ?? "amiri.csv";

    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
