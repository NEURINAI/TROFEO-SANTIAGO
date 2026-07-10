import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import Bracket from "@/components/Bracket";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Torneo de Vóley",
  description: "Cuadro eliminatorio del torneo de voleibol del Trofeo de Santiago.",
};

export default async function VoleyPage() {
  const matches = await prisma.volleyMatch.findMany({
    include: { teamA: true, teamB: true },
    orderBy: [{ round: "asc" }, { slot: "asc" }],
  });

  const bracket = matches.map((m) => {
    const [a, b] = (m.result || "").split("-").map((x) => x.trim());
    return {
      id: m.id,
      round: m.round,
      slot: m.slot,
      status: m.status,
      field: m.field,
      schedule:
        m.scheduledDate || m.scheduledTime
          ? `${m.scheduledDate || ""} ${m.scheduledTime || ""}`.trim()
          : null,
      sideA: { name: m.teamA?.name || "Por definir", score: a !== undefined && a !== "" ? a : null },
      sideB: { name: m.teamB?.name || "Por definir", score: b !== undefined && b !== "" ? b : null },
      winnerName:
        m.winnerId && m.teamA && m.winnerId === m.teamA.id
          ? m.teamA.name
          : m.winnerId && m.teamB && m.winnerId === m.teamB.id
          ? m.teamB.name
          : null,
    };
  });

  return (
    <div>
      <PageHeader
        mediaKey="header-voley"
        eyebrow="Torneo Táctico"
        title="Torneo de Vóley"
        subtitle="Cuadro eliminatorio. Sigue los enfrentamientos, resultados y horarios."
      />

      <div className="mx-auto max-w-[1280px] space-y-8 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-voley" />
        </div>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">account_tree</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Cuadro de Enfrentamientos</h2>
          </div>
          <Bracket matches={bracket} />
        </section>
      </div>
    </div>
  );
}
