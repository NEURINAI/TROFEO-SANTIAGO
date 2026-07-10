import { prisma } from "@/lib/prisma";

// Devuelve un mapa { key: path } de todos los medios gestionados.
export async function getMediaMap() {
  const assets = await prisma.mediaAsset.findMany();
  return assets.reduce((acc, a) => {
    acc[a.key] = a.path;
    return acc;
  }, {});
}

// Devuelve la ruta de un medio por su clave, o un fallback.
export async function getMediaPath(key, fallback = null) {
  const asset = await prisma.mediaAsset.findUnique({ where: { key } });
  return asset?.path || fallback;
}
