import { prisma } from "@/lib/prisma";

/*
  Clasificación general automática.

  El total de cada equipo se compone de:
    - Cross:       suma de los puntos de sus resultados individuales
    - CrossFit:    puntos del resultado del equipo
    - Paellas:     puntos totales del equipo
    - Vóley:       puntos obtenidos como Equipo A y como Equipo B
    - PlayStation: suma de los puntos de sus jugadores
    - Ajuste manual del administrador (manualAdjust)

  `recomputeTeamTotals()` recalcula y persiste `Team.totalPoints`.
  Debe llamarse tras cualquier cambio en los resultados para que el
  podio y la tabla de la Clasificación General se actualicen solos.
*/

export async function computeTeamTotals() {
  const teams = await prisma.team.findMany({
    include: {
      crossResults: true,
      crossfitResult: true,
      paellaResult: true,
      volleyMatchA: true,
      volleyMatchB: true,
      psPlayers: true,
    },
  });

  return teams.map((team) => {
    const crossPoints = team.crossResults.reduce((acc, r) => acc + (r.points || 0), 0);
    const crossfitPoints = team.crossfitResult?.points || 0;
    const paellaPoints = team.paellaResult?.totalPoints || 0;
    const volleyPoints =
      team.volleyMatchA.reduce((acc, m) => acc + (m.teamAPoints || 0), 0) +
      team.volleyMatchB.reduce((acc, m) => acc + (m.teamBPoints || 0), 0);
    const psPoints = team.psPlayers.reduce((acc, p) => acc + (p.points || 0), 0);

    const total =
      crossPoints + crossfitPoints + paellaPoints + volleyPoints + psPoints + (team.manualAdjust || 0);

    return {
      id: team.id,
      name: team.name,
      observations: team.observations,
      manualAdjust: team.manualAdjust || 0,
      breakdown: {
        cross: crossPoints,
        crossfit: crossfitPoints,
        paellas: paellaPoints,
        voley: volleyPoints,
        playstation: psPoints,
      },
      totalPoints: total,
    };
  });
}

// Recalcula y persiste el total de cada equipo. Devuelve la clasificación ordenada.
export async function recomputeTeamTotals() {
  const totals = await computeTeamTotals();

  await Promise.all(
    totals.map((t) =>
      prisma.team.update({ where: { id: t.id }, data: { totalPoints: t.totalPoints } })
    )
  );

  return totals.sort((a, b) => b.totalPoints - a.totalPoints);
}

// Clasificación general ordenada (recalculada en vivo, sin escribir en BD).
export async function getGeneralStandings() {
  const totals = await computeTeamTotals();
  return totals.sort((a, b) => b.totalPoints - a.totalPoints);
}
