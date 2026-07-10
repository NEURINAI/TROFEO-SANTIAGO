#!/bin/sh
set -e

echo "==> Preparando medios por defecto..."
# Si los volúmenes de medios están vacíos, sembrar los archivos por defecto.
for d in images uploads; do
  if [ -d "/app/public/$d" ] && [ -z "$(ls -A /app/public/$d 2>/dev/null)" ]; then
    cp -r /app/defaults/$d/. /app/public/$d/ 2>/dev/null || true
    echo "    Medios por defecto copiados en public/$d"
  fi
done

echo "==> Aplicando migraciones de la base de datos..."
npx prisma migrate deploy

echo "==> Sembrando datos iniciales (idempotente)..."
node prisma/seed.js || true

echo "==> Iniciando la aplicación en el puerto 3000..."
exec node_modules/.bin/next start -p 3000 -H 0.0.0.0
