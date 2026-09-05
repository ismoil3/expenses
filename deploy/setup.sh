#!/usr/bin/env bash
# ============================================================
#  Amiri — танзими деплой.
#
#     bash deploy/setup.sh              # суроға = IP-и сервер
#     bash deploy/setup.sh example.tj   # суроға = домен (HTTPS)
#
#  Скрипт .env месозад ва сирҳои тасодуфиро худаш пур мекунад.
#  .env-и мавҷударо ҲЕҶ ГОҲ намешиканад.
# ============================================================
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

[ -d backend ] && [ -d frontend ] || {
    echo "✗ Дар $ROOT папкаҳои backend ва frontend нестанд."
    exit 1
}

if [ -f .env ]; then
    echo "• .env аллакай ҳаст — даст намерасонем"
else
    cp .env.example .env
    chmod 600 .env

    # Сирҳо: аз openssl, на дастӣ — то парол «123456» нашавад
    sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 16)|" .env
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
    sed -i "s|^WEBHOOK_SECRET=.*|WEBHOOK_SECRET=$(openssl rand -hex 16)|" .env

    if [ "${1:-}" != "" ]; then
        # Домен дода шуд → HTTPS, webhook, Mini App дар Telegram кор мекунад
        HOST=${1#http*://}; HOST=${HOST%%/*}
        sed -i "s|^BOT_MODE=.*|BOT_MODE=webhook|"           .env
        sed -i "s|^PUBLIC_URL=.*|PUBLIC_URL=https://$HOST|" .env
        sed -i "s|^PANEL_URL=.*|PANEL_URL=https://$HOST|"   .env
        echo "✓ .env — домени https://$HOST, реҷаи webhook"
    else
        IP=$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
        sed -i "s|SERVER_IP|$IP|g" .env
        echo "✓ .env — IP $IP, реҷаи polling"
    fi
fi

echo
echo "Қадами навбатӣ: BOT_TOKEN ва OPENAI_API_KEY-ро гузоред —"
echo "    nano $ROOT/.env"
echo "Сипас:"
echo "    cd $ROOT && docker compose up -d --build"
