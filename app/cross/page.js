import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import ResultsTable from "@/components/ResultsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Competición de Cross",
  description: "Clasificación individual y por equipos de la carrera de Cross del Trofeo de Santiago.",
};

export default async function CrossPage() {
  const results = await prisma.crossResult.findMany({
    include: { team: true },
    orderBy: [{ points: "desc" }, { time: "asc" }],
  });

  const individual = results.map((r) => ({
    id: r.id,
    nombre: r.individualName || "—",
    equipo: r.team?.name || "—",
    tiempo: r.time || "—",
    puntos: r.points,
  }));

  const teamMap = results.reduce((acc, r) => {
    const name = r.team?.name || "—";
    acc[name] = (acc[name] || 0) + r.points;
    return acc;
  }, {});
  const teams = Object.entries(teamMap)
    .map(([equipo, puntos], i) => ({ id: i, equipo, puntos }))
    .sort((a, b) => b.puntos - a.puntos);

  return (
    <div>
      <PageHeader
        mediaKey="header-cross"
        eyebrow="Prueba de Resistencia"
        title="Competición de Cross"
        subtitle="Carrera a campo través. Clasificación individual y por equipos."
      />

      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-cross" />
        </div>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">person</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación Individual</h2>
          </div>
          <ResultsTable
            rankColumn
            searchPlaceholder="Buscar corredor o equipo..."
            columns={[
              { key: "nombre", label: "Nombre" },
              { key: "equipo", label: "Equipo" },
              { key: "tiempo", label: "Tiempo", mono: true },
              { key: "puntos", label: "Puntos", mono: true, align: "right" },
            ]}
            rows={individual}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">groups</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación por Equipos</h2>
          </div>
          <p className="mb-4 text-sm text-on-surface-variant">
            Los puntos de equipo se suman automáticamente a la clasificación general.
          </p>
          <ResultsTable
            rankColumn
            searchPlaceholder="Buscar equipo..."
            columns={[
              { key: "equipo", label: "Equipo" },
              { key: "puntos", label: "Puntos en Cross", mono: true, align: "right" },
            ]}
            rows={teams}
          />
        </section>
      </div>
    </div>
  );
}
