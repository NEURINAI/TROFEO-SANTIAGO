# Despliegue gratuito con HTTPS (Vercel + Neon)

Guía para publicar el Trofeo de Santiago **gratis, sin tarjeta**, con HTTPS.

- **Vercel** aloja la app y la compila en su servidor (tu conexión solo sube el código).
- **Neon** aporta la base de datos **PostgreSQL** gratuita para que los datos persistan.

> Nota: en Vercel el disco es de solo lectura, por lo que **subir imágenes/PDF nuevos desde
> el panel de administración no funciona en producción** (sí en local). El cartel, cabeceras,
> lámina y normas ya incluidos se ven sin problema. Todo lo demás (equipos, resultados,
> calendario, clasificación, cuadros, PlayStation) es 100% editable porque va a la base de datos.

---

## 1. Crear la base de datos (Neon) — sin tarjeta

1. Entra en <https://neon.tech> y regístrate (puedes usar tu cuenta de GitHub).
2. Crea un proyecto (Project). Región: elige Europa (p. ej. Frankfurt).
3. En el panel del proyecto, copia la **Connection string** (empieza por `postgresql://...`).
   Asegúrate de que incluya `?sslmode=require`.
4. **Pásame esa cadena** para configurar la migración de la base de datos.

## 2. Migración a PostgreSQL (lo hago yo)

Con tu cadena de Neon:
- Cambio el proveedor de Prisma a `postgresql`.
- Genero la migración inicial y siembro los 8 equipos + medios en Neon.
- Hago el commit final.

## 3. Subir el código a GitHub

En la carpeta `trofeo-app` (ya tiene git inicializado):

```bash
git add -A
git commit -m "Trofeo de Santiago"
git branch -M main
git remote add origin https://github.com/NEURINAI/trofeo-santiago.git
git push -u origin main
```

(Primero crea el repositorio vacío `trofeo-santiago` en <https://github.com/new>.)

## 4. Desplegar en Vercel

1. Entra en <https://vercel.com> y regístrate con GitHub.
2. **Add New → Project** e importa el repositorio `trofeo-santiago`.
3. **Root Directory:** déjalo en la raíz del repo (donde está `package.json`).
4. En **Environment Variables** añade:
   - `DATABASE_URL` = la cadena de Neon (la misma del paso 1).
   - `JWT_SECRET` = una frase larga y aleatoria propia.
   - `NEXT_PUBLIC_SITE_URL` = la URL que te dará Vercel (p. ej. `https://trofeo-santiago.vercel.app`).
5. Pulsa **Deploy**. Vercel ejecuta `prisma generate && prisma migrate deploy && next build`.

Al terminar tendrás la web pública con HTTPS en `https://<tu-proyecto>.vercel.app`.

## 5. Acceso de administrador

- URL: `https://<tu-proyecto>.vercel.app/admin`
- Usuario: `admin` · Contraseña: `admin1234`  → **cámbiala tras el primer acceso.**

## Actualizaciones futuras

Cada cambio se publica solo con:

```bash
git add -A && git commit -m "cambios" && git push
```

Vercel detecta el push y vuelve a desplegar automáticamente.
