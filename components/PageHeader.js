import { getMediaPath } from "@/lib/media";

// Cabecera de página con imagen de fondo (gestionable desde el admin), overlay oscuro y título.
export default async function PageHeader({ mediaKey, title, subtitle, eyebrow }) {
  const image = mediaKey ? await getMediaPath(mediaKey) : null;

  return (
    <header
      className="relative flex aspect-[1376/560] max-h-[480px] min-h-[220px] items-end overflow-hidden border-b-2 border-primary-container"
      style={
        image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: "linear-gradient(135deg, #1c1b1b 0%, #2c3316 100%)" }
      }
    >
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />
      <div className="bg-tactical-noise absolute inset-0" />
      <div className="relative z-10 w-full px-6 pb-8 pt-16 md:px-12 md:pt-24">
        {eyebrow && <p className="label-caps mb-2 text-tertiary">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-bold leading-tight text-on-surface md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-2xl text-on-surface-variant">{subtitle}</p>}
      </div>
    </header>
  );
}
