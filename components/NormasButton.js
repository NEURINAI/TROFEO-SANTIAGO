import { getMediaPath } from "@/lib/media";

// Botón para descargar el PDF de normas de una competición (clave del MediaAsset).
export default async function NormasButton({ mediaKey, label = "Descargar Normas" }) {
  const path = await getMediaPath(mediaKey);
  if (!path) return null;

  return (
    <a
      href={path}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border-2 border-tertiary bg-tertiary px-5 py-2.5 text-on-tertiary transition-colors hover:bg-tertiary-container"
    >
      <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
      <span className="label-caps">{label}</span>
    </a>
  );
}
