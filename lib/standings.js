import { prisma } from "@/lib/prisma";

/*
  Clasificación general automática.

  El total de cada equipo se compone de:
    - CrossFit: puntos del resultado del equipo
    - Paellas:  puntos totales del equipo
    - Ajuste manual del administrador (manualAdjust)

  Cross, Vóley y PlayStation (FIFA26) NO se suman automáticamente: usan unidades
  escritas a mano y/o puntuaciones propias (p. ej. Cross puntúa por suma de
  puestos). Su aporte a la clasificación general se introduce manualmente
  mediante el "Ajuste manual" de cada equipo.

  `recomputeTeamTotals()` recalcula y persiste `Team.totalPoints`.
*/

export async function computeTeamTotals() {
  const teams = await prisma.team.findMany({
    include: {
      crossfitResult: true,
      paellaResult: true,
    },
  });

  return teams.map((team) => {
    const crossfitPoints = team.crossfitResult?.points || 0;
    const paellaPoints = team.paellaResult?.totalPoints || 0;

    const total = crossfitPoints + paellaPoints + (team.manualAdjust || 0);

    return {
      id: team.id,
      name: team.name,
      observations: team.observations,
      manualAdjust: team.manualAdjust || 0,
      breakdown: {
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
