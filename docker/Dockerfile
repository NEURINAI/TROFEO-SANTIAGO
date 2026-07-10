# --- Trofeo de Santiago — imagen de producción (Next.js 16 + Prisma + SQLite) ---
FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# Dependencias
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Compilación
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Ejecución
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app ./

# Guardar los medios por defecto fuera del volumen para poder sembrarlos la 1ª vez.
RUN mkdir -p /app/defaults \
  && cp -r /app/public/images /app/defaults/images \
  && cp -r /app/public/uploads /app/defaults/uploads

COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
