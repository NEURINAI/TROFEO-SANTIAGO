# Trofeo de Santiago

Portal web oficial del **Trofeo de Santiago**, evento deportivo militar en honor al Patrón de
Caballería. Permite consultar públicamente toda la información del evento y gestionarla al completo
desde un panel de administración privado, **sin tocar código**.

Aplicación totalmente en español, con estética militar profesional (tema oscuro) y lista para producción.

---

## Características

**Zona pública** (sin registro):

- Portada con el cartel oficial y el calendario de actividades.
- **Clasificación General** con podio de honor animado, tabla con buscador, ordenación y filtros,
  y **modo pantalla completa** para proyectar.
- Competiciones: **Cross** (individual y por equipos), **Vóley** (cuadro eliminatorio), **CrossFit**,
  **Concurso de Paellas** y **Torneo PlayStation EA SPORTS FC** (cuadro eliminatorio + clasificación).
- **Normas** en PDF descargables por competición.
- Exportación de la clasificación a **Excel** y **PDF** (acta).
- Responsive (móvil, tablet, ordenador), PWA instalable, SEO y optimización de imágenes.

**Panel de administración** (`/admin`, protegido con JWT):

- Gestión de equipos, calendario, clasificación (ajustes y observaciones).
- Resultados de Cross, Vóley (cuadro), CrossFit y Paellas.
- Torneo PlayStation completo: participantes, emparejamientos, resultados (con **avance automático del
  cuadro**) y reinicio del torneo.
- Cartel, imágenes de cabecera y PDFs de normas.
- **La puntuación de cada competición se suma automáticamente a la clasificación general.**

---

## Tecnologías

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** (tema oscuro militar)
- **Prisma ORM** + **SQLite** (arquitectura preparada para migrar a PostgreSQL)
- Autenticación **JWT** + contraseñas con **bcrypt**
- Subida de archivos mediante Server Actions
- Exportación con **ExcelJS** y **pdf-lib**

> Nota: la aplicación usa Next.js, que integra el frontend (React) y el backend (route handlers y
> Server Actions) en un único proyecto desplegable; no requiere un servidor Express separado. La
> interactividad de tablas (buscador/orden/filtros) se resuelve con componentes de cliente, por lo que
> no se emplea React Query.

---

## Requisitos

- **Node.js 20.9+**
- npm
- (Opcional) **Docker** y **Docker Compose** para el despliegue

---

## Puesta en marcha en desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env       # revisa DATABASE_URL y JWT_SECRET

# 3. Crear la base de datos y aplicar migraciones
npx prisma migrate dev

# 4. Sembrar datos de ejemplo (admin, equipos, calendario, resultados...)
npm run seed

# 5. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Acceso al panel de administración

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Usuario: **admin**
- Contraseña: **admin1234**

> Cambia la contraseña del administrador en producción (puedes editar `prisma/seed.js` o actualizar el
> registro `Admin` en la base de datos).

---

## Despliegue con Docker

```bash
# Construye la imagen y levanta el contenedor en segundo plano
docker compose up -d --build
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000). El contenedor
aplica las migraciones y siembra los datos automáticamente al arrancar.

Persistencia (volúmenes de Docker):

- `trofeo-db` → base de datos SQLite (`/app/data/dev.db`)
- `trofeo-images` → imágenes de cabecera y cartel (`/app/public/images`)
- `trofeo-uploads` → PDFs de normas y galería (`/app/public/uploads`)

Configura el secreto JWT antes de desplegar, por ejemplo con un archivo `.env` junto al
`docker-compose.yml`:

```env
JWT_SECRET=un-secreto-largo-y-aleatorio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.example
```

Para detener y eliminar el contenedor:

```bash
docker compose down          # conserva los volúmenes (datos)
docker compose down -v       # elimina también los datos
```

---

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción (tras `build`) |
| `npm run seed` | Siembra datos de ejemplo (idempotente) |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run prisma:deploy` | Aplica migraciones en producción |
| `npm run backup` | Copia de seguridad de la base de datos en `./backups` |
| `npm run docker:up` | Construye y levanta con Docker Compose |
| `npm run docker:down` | Detiene Docker Compose |

---

## Copias de seguridad

```bash
npm run backup
```

Genera una copia con marca temporal en `./backups`. Puedes automatizarla con una tarea programada
(cron en Linux, Programador de tareas en Windows). En Docker, basta con copiar periódicamente el
volumen `trofeo-db` o ejecutar el script dentro del contenedor.

---

## Migrar a PostgreSQL

1. En `prisma/schema.prisma`, cambia el `datasource`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Ajusta `DATABASE_URL` en `.env` a tu cadena de conexión de PostgreSQL.
3. Ejecuta `npx prisma migrate dev` para generar las migraciones equivalentes.

El modelo de datos no usa tipos exclusivos de SQLite, por lo que la migración es directa.

---

## Estructura del proyecto

```
trofeo-app/
├── app/                 # Rutas (App Router): páginas públicas, /admin y /api
│   ├── admin/           # Panel de administración
│   ├── api/             # Route handlers (login, exportaciones)
│   └── ...              # Portada, clasificación, competiciones, normas
├── components/          # Componentes reutilizables (Sidebar, Bracket, tablas...)
├── lib/                 # Utilidades (prisma, auth, agregación, subida, estilos)
├── prisma/              # Esquema, migraciones y semilla
├── public/              # Estáticos (imágenes, cartel, PDFs, icono)
├── scripts/             # Utilidades (copia de seguridad)
└── docker/              # Dockerfile y entrypoint
```

---

© Trofeo de Santiago · Aplicación oficial.
