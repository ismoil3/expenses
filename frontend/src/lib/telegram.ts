/** Кор бо Telegram Mini App — агар панел дар дохили Telegram кушода шавад. */

interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
  colorScheme?: string;
  themeParams?: Record<string, string>;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function webApp(): TelegramWebApp | null {
  const app = window.Telegram?.WebApp;
  return app && app.initData ? app : null;
}

export function isMiniApp(): boolean {
  return webApp() !== null;
}

/** Ба Telegram мегӯяд, ки саҳифа омода аст ва онро васеъ мекунад. */
export function prepareMiniApp(): void {
  const app = window.Telegram?.WebApp;
  if (!app) return;
  try {
    app.ready();
    app.expand();
  } catch {
    /* берун аз Telegram — фарқ надорад */
  }
}
