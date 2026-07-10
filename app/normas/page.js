import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Normas y Reglamentos",
  description: "Descarga los reglamentos oficiales de cada competición del Trofeo de Santiago.",
};

// Orden y etiqueta amigable de las normas
const ORDEN = [
  { key: "norma-generales", label: "Normas Generales", icon: "gavel" },
  { key: "norma-cross", label: "Normas de Cross", icon: "directions_run" },
  { key: "norma-voley", label: "Normas de Vóley", icon: "sports_volleyball" },
  { key: "norma-crossfit", label: "Normas de CrossFit", icon: "fitness_center" },
  { key: "norma-paellas", label: "Normas del Concurso de Paellas", icon: "skillet" },
  { key: "norma-playstation", label: "Normas de EA SPORTS FC", icon: "stadia_controller" },
];

export default async function NormasPage() {
  const assets = await prisma.mediaAsset.findMany({ where: { type: "pdf" } });
  const map = assets.reduce((acc, a) => ((acc[a.key] = a), acc), {});
  const rules = ORDEN.map((o) => ({ ...o, asset: map[o.key] })).filter((r) => r.asset);

  return (
    <div>
      <PageHeader
        mediaKey="header-normas"
        eyebrow="Documentación Oficial"
        title="Normas y Reglamentos"
        subtitle="Consulta y descarga los reglamentos oficiales de cada competición."
      />

      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
        {rules.length === 0 ? (
          <p className="border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
            Aún no se han publicado normas.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant border border-outline-variant">
            {rules.map((rule) => (
              <div
                key={rule.key}
                className="flex items-center justify-between gap-4 bg-surface-container p-4 transition-colors hover:bg-surface-high"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">{rule.icon}</span>
                  <span className="truncate font-display text-lg text-on-surface">{rule.label}</span>
                </div>
                <a
                  href={rule.asset.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 border-2 border-tertiary bg-tertiary px-4 py-2 text-on-tertiary transition-colors hover:bg-tertiary-container"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span className="label-caps">Descargar</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
