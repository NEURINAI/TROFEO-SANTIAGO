import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { put, del } from "@vercel/blob";

/*
  Guarda un archivo subido (File de un FormData) y devuelve su URL/ruta pública.

  - En producción (Vercel, disco de solo lectura): sube el archivo a **Vercel Blob**
    si existe la variable BLOB_READ_WRITE_TOKEN. Devuelve una URL https absoluta.
  - En local/self-hosted: escribe en /public y devuelve una ruta relativa (p. ej. /uploads/...).

  subdir: carpeta lógica (uploads | images ...)
  prefix: prefijo del nombre generado.
*/
export async function saveUpload(file, subdir = "uploads", prefix = "file") {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;

  const ext = (path.extname(file.name || "") || "").toLowerCase();
  const safePrefix = String(prefix).replace(/[^a-z0-9-_]/gi, "-");
  const filename = `${safePrefix}-${Date.now()}${ext}`;

  // --- Producción: Vercel Blob ---
  // Se usa si hay token explícito (BLOB_READ_WRITE_TOKEN) o si el store está conectado
  // (BLOB_STORE_ID). En Vercel, sin token explícito, el SDK autentica vía OIDC
  // automáticamente usando BLOB_STORE_ID + VERCEL_OIDC_TOKEN.
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    try {
      const opts = { access: "public", contentType: file.type || undefined };
      if (process.env.BLOB_READ_WRITE_TOKEN) opts.token = process.env.BLOB_READ_WRITE_TOKEN;
      const blob = await put(`${subdir}/${filename}`, file, opts);
      return blob.url; // URL https absoluta
    } catch (e) {
      console.warn("saveUpload (Blob): no se pudo subir el archivo:", e?.message);
      return null;
    }
  }

  // --- Local / self-hosted: sistema de archivos ---
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir = path.join(process.cwd(), "public", subdir);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return `/${subdir.replace(/\\/g, "/")}/${filename}`.replace(/\/+/g, "/");
  } catch (e) {
    console.warn("saveUpload (FS): no se pudo guardar el archivo:", e?.code || e?.message);
    return null;
  }
}

// Elimina un archivo previamente subido (URL de Blob o ruta local). No falla si no existe.
export async function removePublicFile(publicPath) {
  if (!publicPath) return;
  try {
    if (publicPath.startsWith("http")) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(publicPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      }
    } else if (publicPath.startsWith("/")) {
      await unlink(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
    }
  } catch {
    // El archivo puede no existir (p. ej. medios por defecto); se ignora.
  }
}
