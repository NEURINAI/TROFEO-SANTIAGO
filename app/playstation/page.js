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
  const [players, matches, groupTeams] = await Promise.all([
    prisma.psPlayer.findMany({ orderBy: [{ wins: "desc" }, { name: "asc" }] }),
    prisma.psMatch.findMany({ orderBy: [{ round: "asc" }, { slot: "asc" }] }),
    prisma.psGroupTeam.findMany({ orderBy: [{ wins: "desc" }, { points: "desc" }] }),
  ]);

  const groupNames = [...new Set(groupTeams.map((t) => t.groupName))].sort();
  const groups = groupNames.map((g) => ({
    name: g,
    teams: groupTeams.filter((t) => t.groupName === g),
  }));

  const bracket = matches.map((m) => ({
    id: m.id,
    round: m.round,
    roundLabel: m.roundLabel,
    slot: m.slot,
    status: m.status,
    schedule: m.scheduledTime ? `${m.scheduledTime} h` : null,
    sideA: { name: m.playerAName || "Por definir", score: m.scoreA },
    sideB: { name: m.playerBName || "Por definir", score: m.scoreB },
    winnerName: m.winnerName || null,
  }));

  const classification = players.map((p) => ({
    id: p.id,
    participante: p.name,
    equipo: p.militaryUnit || "—",
    victorias: p.wins,
    derrotas: p.losses,
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

        {/* Fase de grupos */}
        {groups.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">groups</span>
              <h2 className="font-display text-2xl font-bold text-on-surface">Fase de Grupos</h2>
            </div>
            <p className="mb-6 text-sm text-on-surface-variant">Clasificación por victorias y puntos.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {groups.map((grp) => (
                <div key={grp.name} className="border border-outline-variant">
                  <div className="border-b-2 border-primary-container bg-surface-high px-4 py-2">
                    <h3 className="font-display text-lg font-bold text-on-surface">{grp.name}</h3>
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-container">
                        <th className="label-caps px-3 py-2 text-left text-on-surface-variant">Pos</th>
                        <th className="label-caps px-3 py-2 text-left text-on-surface-variant">Equipo</th>
                        <th className="label-caps px-3 py-2 text-right text-on-surface-variant">PJ</th>
                        <th className="label-caps px-3 py-2 text-right text-on-surface-variant">V</th>
                        <th className="label-caps px-3 py-2 text-right text-on-surface-variant">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grp.teams.map((t, i) => {
                        const clasifica = t.classified;
                        return (
                          <tr
                            key={t.id}
                            className={`border-t border-outline-variant ${clasifica ? "bg-primary-container/20" : ""}`}
                          >
                            <td className="data-mono px-3 py-2">
                              <span className={clasifica ? "text-tertiary" : "text-on-surface-variant"}>
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </td>
                            <td className={`px-3 py-2 ${clasifica ? "font-semibold text-on-surface" : "text-on-surface"}`}>
                              {t.teamName}
                              {clasifica && (
                                <span className="label-caps ml-2 border border-tertiary px-1.5 py-0.5 text-tertiary">
                                  Clasifica
                                </span>
                              )}
                            </td>
                            <td className="data-mono px-3 py-2 text-right text-on-surface-variant">{t.played}</td>
                            <td className="data-mono px-3 py-2 text-right text-on-surface">{t.wins}</td>
                            <td className="data-mono px-3 py-2 text-right font-bold text-on-surface">{t.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>
        )}

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
            ]}
            rows={classification}
          />
        </section>
      </div>
    </div>
  );
}
