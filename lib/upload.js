import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

/*
  Guarda un archivo subido (File de un FormData) dentro de /public.
  Devuelve la ruta pública (p. ej. "/uploads/gallery/foto-123.jpg").
  subdir: carpeta dentro de public (uploads | images | uploads/gallery ...)
  prefix: prefijo del nombre generado.
*/
export async function saveUpload(file, subdir = "uploads", prefix = "file") {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = path.join(process.cwd(), "public", subdir);
    await mkdir(dir, { recursive: true });

    const ext = (path.extname(file.name || "") || "").toLowerCase();
    const safePrefix = String(prefix).replace(/[^a-z0-9-_]/gi, "-");
    const filename = `${safePrefix}-${Date.now()}${ext}`;
    await writeFile(path.join(dir, filename), buffer);

    return `/${subdir.replace(/\\/g, "/")}/${filename}`.replace(/\/+/g, "/");
  } catch (e) {
    // En hostings de solo lectura (p. ej. Vercel) no se puede escribir en disco.
    // Se ignora para no romper la acción; la subida solo funciona en local/self-hosted.
    console.warn("saveUpload: no se pudo guardar el archivo:", e?.code || e?.message);
    return null;
  }
}

// Elimina un archivo de /public a partir de su ruta pública. No falla si no existe.
export async function removePublicFile(publicPath) {
  if (!publicPath || !publicPath.startsWith("/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
  } catch {
    // El archivo puede no existir (p. ej. medios por defecto); se ignora.
  }
}
