import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import ResultsTable from "@/components/ResultsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Concurso de Paellas",
  description: "Clasificación del concurso de paellas del Trofeo de Santiago: sabor, punto del arroz, presentación, color y total.",
};

export default async function PaellasPage() {
  const results = await prisma.paellaResult.findMany({
    include: { team: true },
    orderBy: { totalPoints: "desc" },
  });

  const rows = results.map((r) => ({
    id: r.id,
    equipo: r.team?.name || "—",
    sabor: r.sabor,
    puntoArroz: r.puntoArroz,
    presentacion: r.presentacion,
    color: r.color,
    total: r.totalPoints,
  }));

  return (
    <div>
      <PageHeader
        mediaKey="header-paellas"
        eyebrow="Logística Culinaria"
        title="Concurso de Paellas"
        subtitle="Valoración por sabor, punto del arroz, presentación y color."
      />

      <div className="mx-auto max-w-[1280px] space-y-8 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-paellas" />
        </div>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">skillet</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación</h2>
          </div>
          <ResultsTable
            rankColumn
            searchPlaceholder="Buscar equipo..."
            columns={[
              { key: "equipo", label: "Equipo" },
              { key: "sabor", label: "Sabor", mono: true, align: "right" },
              { key: "puntoArroz", label: "Punto del arroz", mono: true, align: "right" },
              { key: "presentacion", label: "Presentación", mono: true, align: "right" },
              { key: "color", label: "Color", mono: true, align: "right" },
              { key: "total", label: "Total", mono: true, align: "right" },
            ]}
            rows={rows}
          />
        </section>
      </div>
    </div>
  );
}
