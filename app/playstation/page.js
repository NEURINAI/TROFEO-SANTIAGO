import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import NormasButton from "@/components/NormasButton";
import Bracket from "@/components/Bracket";
import ResultsTable from "@/components/ResultsTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Torneo EA SPORTS FC",
  description: "Cuadro eliminatorio, participantes y clasificación del torneo PlayStation EA SPORTS FC.",
};

export default async function PlaystationPage() {
  const [players, matches] = await Promise.all([
    prisma.psPlayer.findMany({ include: { team: true }, orderBy: [{ points: "desc" }, { wins: "desc" }] }),
    prisma.psMatch.findMany({
      include: { playerA: true, playerB: true },
      orderBy: [{ round: "asc" }, { slot: "asc" }],
    }),
  ]);

  const bracket = matches.map((m) => ({
    id: m.id,
    round: m.round,
    slot: m.slot,
    status: m.status,
    schedule: m.scheduledTime ? `${m.scheduledTime} h` : null,
    sideA: { name: m.playerA?.name || "Por definir", score: m.scoreA },
    sideB: { name: m.playerB?.name || "Por definir", score: m.scoreB },
    winnerName:
      m.winnerId && m.playerA && m.winnerId === m.playerA.id
        ? m.playerA.name
        : m.winnerId && m.playerB && m.winnerId === m.playerB.id
        ? m.playerB.name
        : null,
  }));

  const classification = players.map((p) => ({
    id: p.id,
    participante: p.name,
    equipo: p.team?.name || p.militaryUnit || "—",
    victorias: p.wins,
    derrotas: p.losses,
    puntos: p.points,
  }));

  const participantes = players.map((p) => ({
    id: p.id,
    participante: p.name,
    equipo: p.team?.name || p.militaryUnit || "—",
  }));

  return (
    <div>
      <PageHeader
        mediaKey="header-playstation"
        eyebrow="eSports Militar"
        title="Torneo EA SPORTS FC"
        subtitle="Competición de PlayStation. El cuadro avanza automáticamente al registrar los resultados."
      />

      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-playstation" />
        </div>

        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">account_tree</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Cuadro Eliminatorio</h2>
          </div>
          <Bracket matches={bracket} emptyLabel="El cuadro aún no ha sido definido." />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">leaderboard</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Clasificación</h2>
          </div>
          <ResultsTable
            rankColumn
            searchPlaceholder="Buscar participante o equipo..."
            columns={[
              { key: "participante", label: "Participante" },
              { key: "equipo", label: "Equipo" },
              { key: "victorias", label: "Victorias", mono: true, align: "right" },
              { key: "derrotas", label: "Derrotas", mono: true, align: "right" },
              { key: "puntos", label: "Puntos", mono: true, align: "right" },
            ]}
            rows={classification}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">groups</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Participantes</h2>
          </div>
          <ResultsTable
            searchPlaceholder="Buscar participante..."
            columns={[
              { key: "participante", label: "Participante" },
              { key: "equipo", label: "Equipo Militar" },
            ]}
            rows={participantes}
          />
        </section>
      </div>
    </div>
  );
}
