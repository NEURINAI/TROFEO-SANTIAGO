import { prisma } from "@/lib/prisma";

/*
  Avanza al ganador de un partido a la siguiente ronda del cuadro, si existe
  un enfrentamiento en (round+1, floor(slot/2)). El ganador ocupa el lado A si
  el slot es par, o el lado B si es impar. Trabaja con nombres de texto libre.
*/
export async function advanceWinner(match) {
  if (!match || match.status !== "Finalizado" || !match.winnerName) return;
  const nextRound = match.round + 1;
  const nextSlot = Math.floor(match.slot / 2);
  const next = await prisma.psMatch.findFirst({
    where: { round: nextRound, slot: nextSlot },
  });
  if (!next) return; // Era la final o el cuadro no continúa.
  const side = match.slot % 2 === 0 ? "playerAName" : "playerBName";
  await prisma.psMatch.update({ where: { id: next.id }, data: { [side]: match.winnerName } });
}
