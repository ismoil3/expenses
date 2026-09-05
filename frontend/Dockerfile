# --- 1. билд ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite тағйирёбандаҳоро дар ЛАҲЗАИ БИЛД ба код медӯзад.
# Холӣ мемонад: nginx `/api`-ро худаш ба backend мегузаронад,
# яъне панел ва API як origin доранд — cookie бе мушкил кор мекунад.
ARG VITE_API_URL=""
ARG VITE_BOT_USERNAME=amiri_expenses_bot
ENV VITE_API_URL=$VITE_API_URL \
    VITE_BOT_USERNAME=$VITE_BOT_USERNAME

RUN npm run build

# --- 2. хизматрасонӣ ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
