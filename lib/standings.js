import { prisma } from "@/lib/prisma";

/*
  Clasificación general automática.

  El total de cada equipo se compone de:
    - Cross:    suma de los puntos de sus resultados individuales
    - CrossFit: puntos del resultado del equipo
    - Paellas:  puntos totales del equipo
    - Ajuste manual del administrador (manualAdjust)

  Vóley y PlayStation (FIFA26) NO se suman automáticamente: sus enfrentamientos
  usan equipos escritos a mano (pueden ser más que los de la clasificación), y
  sus puntos se introducen manualmente en la clasificación general mediante el
  "Ajuste manual" de cada equipo.

  `recomputeTeamTotals()` recalcula y persiste `Team.totalPoints`.
*/

export async function computeTeamTotals() {
  const teams = await prisma.team.findMany({
    include: {
      crossResults: true,
      crossfitResult: true,
      paellaResult: true,
    },
  });

  return teams.map((team) => {
    const crossPoints = team.crossResults.reduce((acc, r) => acc + (r.points || 0), 0);
    const crossfitPoints = team.crossfitResult?.points || 0;
    const paellaPoints = team.paellaResult?.totalPoints || 0;

    const total = crossPoints + crossfitPoints + paellaPoints + (team.manualAdjust || 0);

    return {
      id: team.id,
      name: team.name,
      observations: team.observations,
      manualAdjust: team.manualAdjust || 0,
      breakdown: {
        cross: crossPoints,
        crossfit: crossfitPoints,
        paellas: paellaPoints,
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
