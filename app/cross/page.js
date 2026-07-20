import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import ResultsTable from "@/components/ResultsTable";
import CountdownRace from "@/components/CountdownRace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cross Cabo Edgar Mallo Baena 5k",
  description:
    "En recuerdo del cabo Edgar Mallo Baena. Fallecido durante un lanzamiento paracaidista nocturno de apertura manual realizado en Huesca, mientras participaba en el ejercicio Tormenta Alada 2026.",
};

export default async function CrossPage() {
  const [results, teams] = await Promise.all([
    prisma.crossResult.findMany({ orderBy: [{ puesto: "asc" }, { id: "asc" }] }),
    prisma.crossTeamResult.findMany({ orderBy: [{ position: "asc" }, { points: "asc" }] }),
  ]);

  const individual = results.map((r) => ({
    id: r.id,
    puesto: r.puesto ?? "—",
    empleo: r.empleo || "—",
    nombre: r.individualName || "—",
    dorsal: r.dorsal || "—",
    unidad: r.unitName || "—",
    tiempo: r.time || "—",
  }));

  const teamRows = teams.map((t) => ({
    id: t.id,
    clasificacion: t.position ? `${t.position}º` : "—",
    unidad: t.unitName,
    puntos: t.points,
  }));

  return (
    <div>
      <PageHeader
        mediaKey="header-cross"
        eyebrow="Prueba de Resistencia"
        title="Cross Cabo Edgar Mallo Baena 5k"
        subtitle="En recuerdo del cabo Edgar Mallo Baena. Fallecido durante un lanzamiento paracaidista nocturno de apertura manual realizado en Huesca, mientras participaba en el ejercicio Tormenta Alada 2026."
      />

      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-12 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CountdownRace finished />
          <NormasButton mediaKey="norma-cross" />
        </div>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">groups</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación por Equipos</h2>
          </div>
          <p className="mb-4 text-sm text-on-surface-variant">
            Puntuación por suma de puestos: <span className="text-tertiary">menor puntuación, mejor clasificación</span>.
          </p>
          <ResultsTable
            searchPlaceholder="Buscar unidad..."
            initialSort={{ key: "puntos", dir: "asc" }}
            columns={[
              { key: "clasificacion", label: "Clasificación" },
              { key: "unidad", label: "Unidad" },
              { key: "puntos", label: "Puntos", mono: true, align: "right" },
            ]}
            rows={teamRows}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">person</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación Individual</h2>
          </div>
          <ResultsTable
            searchPlaceholder="Buscar corredor, empleo o unidad..."
            initialSort={{ key: "puesto", dir: "asc" }}
            columns={[
              { key: "puesto", label: "Puesto", mono: true },
              { key: "empleo", label: "Empleo" },
              { key: "nombre", label: "Apellidos y Nombre" },
              { key: "dorsal", label: "Dorsal", mono: true },
              { key: "unidad", label: "Unidad" },
              { key: "tiempo", label: "Tiempo", mono: true, align: "right" },
            ]}
            rows={individual}
          />
        </section>
      </div>
    </div>
  );
}
