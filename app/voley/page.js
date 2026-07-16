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
  const [matches, groupTeams] = await Promise.all([
    prisma.volleyMatch.findMany({ orderBy: [{ round: "asc" }, { slot: "asc" }] }),
    prisma.volleyGroupTeam.findMany({ orderBy: [{ wins: "desc" }, { points: "desc" }] }),
  ]);

  const groupNames = [...new Set(groupTeams.map((t) => t.groupName))].sort();
  const groups = groupNames.map((g) => ({
    name: g,
    teams: groupTeams.filter((t) => t.groupName === g),
  }));

  const bracket = matches.map((m) => {
    const [a, b] = (m.result || "").split("-").map((x) => x.trim());
    return {
      id: m.id,
      round: m.round,
      roundLabel: m.roundLabel,
      slot: m.slot,
      status: m.status,
      field: m.field,
      schedule:
        m.scheduledDate || m.scheduledTime
          ? `${m.scheduledDate || ""} ${m.scheduledTime || ""}`.trim()
          : null,
      sideA: { name: m.teamAName || "Por definir", score: a !== undefined && a !== "" ? a : null },
      sideB: { name: m.teamBName || "Por definir", score: b !== undefined && b !== "" ? b : null },
      winnerName: m.winnerName || null,
    };
  });

  return (
    <div>
      <PageHeader
        mediaKey="header-voley"
        eyebrow="Torneo Táctico"
        title="Torneo de Vóley"
        subtitle="Fase de grupos y cuadro eliminatorio. Sigue clasificaciones, enfrentamientos y horarios."
      />

      <div className="mx-auto max-w-[1280px] space-y-12 px-6 py-12 md:px-12">
        <div className="flex justify-end">
          <NormasButton mediaKey="norma-voley" />
        </div>

        {/* Fase de grupos */}
        {groups.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">groups</span>
              <h2 className="font-display text-2xl font-bold text-on-surface">Fase de Grupos</h2>
            </div>
            <p className="mb-6 text-sm text-on-surface-variant">
              Clasificación por victorias y puntos.
            </p>
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
                            className={`border-t border-outline-variant ${
                              clasifica ? "bg-primary-container/20" : ""
                            }`}
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
            <h2 className="font-display text-2xl font-bold text-on-surface">Cuadro de Enfrentamientos</h2>
          </div>
          <Bracket matches={bracket} />
        </section>
      </div>
    </div>
  );
}
