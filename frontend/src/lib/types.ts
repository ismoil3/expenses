export type Period = "today" | "week" | "month";

export interface Category {
  id: number;
  key: string;
  emoji: string;
  color: string;
  name: string;
  is_system: boolean;
}

export interface Expense {
  id: number;
  amount: string;
  currency: string;
  amount_base: string;
  description: string;
  occurred_at: string;
  source: string;
  category: Category;
}

/** AI категорияи нав пешниҳод мекунад — корбар тасдиқ мекунад. */
export interface Suggestion {
  key: string;
  emoji: string;
  name: string;
  phrase: string;
}

export interface ExpenseCreated extends Expense {
  suggestion: Suggestion | null;
}

export interface ExpenseList {
  items: Expense[];
  /** Шумораи ҳамаи сатрҳои филтр, на танҳо саҳифаи ҷорӣ */
  total: number;
  /** Ҷамъи ҳамон филтр дар валютаи асосӣ */
  sum: string;
  currency: string;
}

/** Лимити моҳона: чанд харҷ шуд ва аз чанд. */
export interface Limit {
  category: Category;
  amount: string;
  spent: string;
  share: number;
  currency: string;
}

export interface Me {
  id: number;
  tg_id: number;
  first_name: string | null;
  username: string | null;
  lang: string;
  base_currency: string;
  tz: string;
}

/** Ҷавоби вуруд: профил + токени сессия ва мӯҳлати он. */
export interface Login extends Me {
  session_token: string;
  expires_in_days: number;
}

export interface Summary {
  period: Period;
  total: string;
  previous_total: string;
  change_percent: number | null;
  currency: string;
  count: number;
}

export interface CategorySlice {
  category: Category;
  total: string;
  share: number;
}

export interface DayPoint {
  day: string;
  total: string;
}
