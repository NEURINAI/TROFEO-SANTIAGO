import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import { recomputePsStats, advanceWinner } from "@/lib/ps";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

const ESTADOS = ["Pendiente", "EnJuego", "Finalizado"];

function revalidateAll() {
  revalidatePath("/admin/playstation");
  revalidatePath("/playstation");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

async function refreshStats() {
  await recomputePsStats();
  await recomputeTeamTotals();
  revalidateAll();
}

// --- Participantes ---
async function addPlayer(formData) {
  "use server";
  const name = formData.get("name")?.trim();
  const teamId = formData.get("teamId") ? Number(formData.get("teamId")) : null;
  if (name) {
    await prisma.psPlayer.create({ data: { name, teamId } });
    await refreshStats();
  }
}

async function updatePlayer(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const name = formData.get("name")?.trim();
  const teamId = formData.get("teamId") ? Number(formData.get("teamId")) : null;
  if (id && name) {
    await prisma.psPlayer.update({ where: { id }, data: { name, teamId } });
    await refreshStats();
  }
}

async function deletePlayer(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.psMatch.updateMany({ where: { playerAId: id }, data: { playerAId: null } });
    await prisma.psMatch.updateMany({ where: { playerBId: id }, data: { playerBId: null } });
    await prisma.psMatch.updateMany({ where: { winnerId: id }, data: { winnerId: null, status: "Pendiente" } });
    await prisma.psPlayer.delete({ where: { id } });
    await refreshStats();
  }
}

// --- Partidos ---
async function addMatch(formData) {
  "use server";
  const round = Number(formData.get("round")) || 1;
  const slot = Number(formData.get("slot")) || 0;
  const playerAId = formData.get("playerAId") ? Number(formData.get("playerAId")) : null;
  const playerBId = formData.get("playerBId") ? Number(formData.get("playerBId")) : null;
  const scheduledTime = formData.get("scheduledTime") || null;
  await prisma.psMatch.create({ data: { round, slot, playerAId, playerBId, scheduledTime } });
  revalidateAll();
}

async function updateMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  const playerAId = formData.get("playerAId") ? Number(formData.get("playerAId")) : null;
  const playerBId = formData.get("playerBId") ? Number(formData.get("playerBId")) : null;
  const scoreA = formData.get("scoreA") !== "" ? Number(formData.get("scoreA")) : null;
  const scoreB = formData.get("scoreB") !== "" ? Number(formData.get("scoreB")) : null;
  const status = formData.get("status") || "Pendiente";
  const scheduledTime = formData.get("scheduledTime") || null;

  // Determinar ganador automáticamente si el partido está finalizado.
  let winnerId = null;
  if (status === "Finalizado" && scoreA !== null && scoreB !== null && playerAId && playerBId) {
    winnerId = scoreA > scoreB ? playerAId : scoreB > scoreA ? playerBId : null;
  }

  const updated = await prisma.psMatch.update({
    where: { id },
    data: { playerAId, playerBId, scoreA, scoreB, status, scheduledTime, winnerId },
  });

  // Avanzar al ganador en el cuadro y recalcular estadísticas.
  await advanceWinner(updated);
  await refreshStats();
}

async function deleteMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.psMatch.delete({ where: { id } });
    await refreshStats();
  }
}

async function resetTournament() {
  "use server";
  await prisma.psMatch.deleteMany({});
  await prisma.psPlayer.updateMany({ data: { wins: 0, losses: 0, points: 0 } });
  await recomputeTeamTotals();
  revalidateAll();
}

function PlayerSelect({ name, players, defaultValue, placeholder }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className={s.input}>
      <option value="">{placeholder}</option>
      {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

export default async function AdminPlaystation() {
  const [teams, players, matches] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.psPlayer.findMany({ include: { team: true }, orderBy: [{ points: "desc" }, { name: "asc" }] }),
    prisma.psMatch.findMany({
      include: { playerA: true, playerB: true },
      orderBy: [{ round: "asc" }, { slot: "asc" }],
    }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="stadia_controller"
        title="Torneo EA SPORTS FC"
        description="Gestiona participantes, emparejamientos y resultados. El cuadro avanza y los puntos se suman a la clasificación general automáticamente."
      />

      {/* Reiniciar torneo */}
      <div className="mb-8 flex items-center justify-between border border-error-container bg-error-container/10 p-4">
        <div>
          <p className="label-caps text-error">Zona de riesgo</p>
          <p className="text-sm text-on-surface-variant">Elimina todos los partidos y reinicia las estadísticas (conserva los participantes).</p>
        </div>
        <form action={resetTournament}>
          <ConfirmButton
            icon="restart_alt"
            message="¿Reiniciar el torneo? Se eliminarán todos los partidos y se pondrán a cero las estadísticas."
          >
            Reiniciar torneo
          </ConfirmButton>
        </form>
      </div>

      {/* Participantes */}
      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Participantes</h2>
        <form action={addPlayer} className={`${s.panelPad} mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end`}>
          <div>
            <label className={s.label}>Nombre</label>
            <input name="name" required className={s.input} />
          </div>
          <div>
            <label className={s.label}>Equipo militar</label>
            <select name="teamId" className={s.input}>
              <option value="">Sin equipo</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="label-caps">Añadir</span>
          </button>
        </form>

        <div className="space-y-3">
          {players.map((p) => (
            <div key={p.id} className={`${s.panelPad} flex flex-col gap-3 md:flex-row md:items-end`}>
              <form action={updatePlayer} className="grid flex-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <input type="hidden" name="id" value={p.id} />
                <div>
                  <label className={s.label}>Nombre</label>
                  <input name="name" defaultValue={p.name} required className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Equipo</label>
                  <select name="teamId" defaultValue={p.teamId ?? ""} className={s.input}>
                    <option value="">Sin equipo</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Guardar</span>
                </button>
              </form>
              <div className="flex items-center gap-3">
                <span className="data-mono text-sm text-on-surface-variant">
                  {p.wins}V · {p.losses}D · {p.points}pts
                </span>
                <form action={deletePlayer}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message={`¿Eliminar a "${p.name}"?`}>Eliminar</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay participantes.</p>
          )}
        </div>
      </section>

      {/* Emparejamientos */}
      <section>
        <h2 className="label-caps mb-4 text-tertiary">Cuadro y Resultados</h2>
        <details className="mb-4">
          <summary className={`${s.btnPrimary} cursor-pointer list-none`}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Nuevo Emparejamiento</span>
          </summary>
          <form action={addMatch} className={`${s.panelPad} mt-3 grid gap-3 md:grid-cols-2`}>
            <div>
              <label className={s.label}>Ronda</label>
              <input name="round" type="number" min="1" defaultValue={1} className={s.input} />
            </div>
            <div>
              <label className={s.label}>Posición</label>
              <input name="slot" type="number" min="0" defaultValue={0} className={s.input} />
            </div>
            <div>
              <label className={s.label}>Participante A</label>
              <PlayerSelect name="playerAId" players={players} placeholder="Por definir" />
            </div>
            <div>
              <label className={s.label}>Participante B</label>
              <PlayerSelect name="playerBId" players={players} placeholder="Por definir" />
            </div>
            <div>
              <label className={s.label}>Hora</label>
              <input name="scheduledTime" type="time" className={s.input} />
            </div>
            <div className="flex items-end">
              <button type="submit" className={s.btnPrimary}>
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span className="label-caps">Crear</span>
              </button>
            </div>
          </form>
        </details>

        <div className="space-y-4">
          {matches.map((m) => (
            <div key={m.id} className={s.panelPad}>
              <div className="mb-3 flex items-center justify-between">
                <span className="label-caps text-tertiary">
                  Ronda {m.round} · Enc. {String(m.slot + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-on-surface">
                  {m.playerA?.name || "Por definir"} <span className="text-on-surface-variant">vs</span> {m.playerB?.name || "Por definir"}
                </span>
              </div>
              <form action={updateMatch} className="space-y-3">
                <input type="hidden" name="id" value={m.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={s.label}>Participante A</label>
                    <PlayerSelect name="playerAId" players={players} defaultValue={m.playerAId} placeholder="Por definir" />
                  </div>
                  <div>
                    <label className={s.label}>Participante B</label>
                    <PlayerSelect name="playerBId" players={players} defaultValue={m.playerBId} placeholder="Por definir" />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className={s.label}>Goles A</label>
                    <input name="scoreA" type="number" min="0" defaultValue={m.scoreA ?? ""} className={s.input} />
                  </div>
                  <div>
                    <label className={s.label}>Goles B</label>
                    <input name="scoreB" type="number" min="0" defaultValue={m.scoreB ?? ""} className={s.input} />
                  </div>
                  <div>
                    <label className={s.label}>Estado</label>
                    <select name="status" defaultValue={m.status} className={s.input}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e === "EnJuego" ? "En Juego" : e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={s.label}>Hora</label>
                    <input name="scheduledTime" type="time" defaultValue={m.scheduledTime ?? ""} className={s.input} />
                  </div>
                </div>
                <div className="border-t border-outline-variant pt-3">
                  <button type="submit" className={s.btnAccent}>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span className="label-caps">Guardar Resultado</span>
                  </button>
                </div>
              </form>
              <div className="mt-2 flex justify-end">
                <form action={deleteMatch}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton>Eliminar</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay emparejamientos. Crea el cuadro.</p>
          )}
        </div>
      </section>
    </div>
  );
}
