import { prisma } from "@/lib/prisma";

// Puntuación del torneo PlayStation (se suma a la clasificación general del equipo).
export const PS_WIN_POINTS = 3;
export const PS_LOSS_POINTS = 1;

/*
  Recalcula victorias, derrotas y puntos de cada participante a partir de los
  partidos finalizados. Los puntos = victorias*3 + derrotas*1.
*/
export async function recomputePsStats() {
  const [players, matches] = await Promise.all([
    prisma.psPlayer.findMany(),
    prisma.psMatch.findMany({ where: { status: "Finalizado" } }),
  ]);

  const stats = {};
  for (const p of players) stats[p.id] = { wins: 0, losses: 0 };

  for (const m of matches) {
    if (!m.winnerId) continue;
    const loserId =
      m.winnerId === m.playerAId ? m.playerBId : m.winnerId === m.playerBId ? m.playerAId : null;
    if (stats[m.winnerId]) stats[m.winnerId].wins += 1;
    if (loserId && stats[loserId]) stats[loserId].losses += 1;
  }

  await Promise.all(
    players.map((p) => {
      const st = stats[p.id] || { wins: 0, losses: 0 };
      const points = st.wins * PS_WIN_POINTS + st.losses * PS_LOSS_POINTS;
      return prisma.psPlayer.update({
        where: { id: p.id },
        data: { wins: st.wins, losses: st.losses, points },
      });
    })
  );
}

/*
  Avanza al ganador de un partido a la siguiente ronda del cuadro, si existe
  un enfrentamiento en (round+1, floor(slot/2)). El ganador ocupa el lado A si
  el slot es par, o el lado B si es impar.
*/
export async function advanceWinner(match) {
  if (!match || match.status !== "Finalizado" || !match.winnerId) return;
  const nextRound = match.round + 1;
  const nextSlot = Math.floor(match.slot / 2);
  const next = await prisma.psMatch.findFirst({
    where: { round: nextRound, slot: nextSlot },
  });
  if (!next) return; // Era la final o el cuadro no continúa.
  const side = match.slot % 2 === 0 ? "playerAId" : "playerBId";
  await prisma.psMatch.update({ where: { id: next.id }, data: { [side]: match.winnerId } });
}
