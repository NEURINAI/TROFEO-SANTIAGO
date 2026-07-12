import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import ResultsTable from "@/components/ResultsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Desafío Pezuela",
  description: "Clasificación por equipos del Desafío Pezuela del Trofeo de Santiago.",
};

export default async function CrossfitPage() {
  const results = await prisma.crossfitResult.findMany({
    include: { team: true },
    orderBy: { points: "desc" },
  });

  const rows = results.map((r) => ({
    id: r.id,
    equipo: r.team?.name || "—",
    tiempo: r.time || "—",
    puntos: r.points,
  }));

  return (
    <div>
      <PageHeader
        mediaKey="header-crossfit"
        eyebrow="Fuerza y Resistencia"
        title="Desafío Pezuela"
        subtitle="Pruebas funcionales por equipos. Clasificación según tiempo y puntos."
      />

      <div className="mx-auto max-w-[1280px] space-y-8 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-crossfit" />
        </div>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">fitness_center</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación por Equipos</h2>
          </div>
          <ResultsTable
            rankColumn
            searchPlaceholder="Buscar equipo..."
            columns={[
              { key: "equipo", label: "Equipo" },
              { key: "tiempo", label: "Tiempo", mono: true },
              { key: "puntos", label: "Puntos", mono: true, align: "right" },
            ]}
            rows={rows}
          />
        </section>
      </div>
    </div>
  );
}
