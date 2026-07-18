import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { advanceWinner } from "@/lib/ps";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";
import { BRACKET_PHASES } from "@/lib/phases";

export const dynamic = "force-dynamic";

const ESTADOS = ["Pendiente", "EnJuego", "Finalizado"];

function revalidateAll() {
  revalidatePath("/admin/playstation");
  revalidatePath("/playstation");
}

// --- Enfrentamientos (nombres a mano) ---
function parseMatch(formData) {
  const playerAName = formData.get("playerAName")?.trim() || null;
  const playerBName = formData.get("playerBName")?.trim() || null;
  const scoreA = formData.get("scoreA") !== "" ? Number(formData.get("scoreA")) : null;
  const scoreB = formData.get("scoreB") !== "" ? Number(formData.get("scoreB")) : null;
  const status = formData.get("status") || "Pendiente";
  const scheduledTime = formData.get("scheduledTime") || null;

  // Ganador automático si está finalizado y hay marcador.
  let winnerName = null;
  if (status === "Finalizado" && scoreA !== null && scoreB !== null) {
    winnerName = scoreA > scoreB ? playerAName : scoreB > scoreA ? playerBName : null;
  }
  const roundLabel = formData.get("roundLabel")?.trim() || null;
  const field = formData.get("field")?.trim() || null;
  return { playerAName, playerBName, scoreA, scoreB, status, scheduledTime, winnerName, roundLabel, field };
}

async function addMatch(formData) {
  "use server";
  const round = Number(formData.get("round")) || 1;
  const slot = Number(formData.get("slot")) || 0;
  const created = await prisma.psMatch.create({ data: { round, slot, ...parseMatch(formData) } });
  await advanceWinner(created);
  revalidateAll();
}

async function updateMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  const round = Number(formData.get("round")) || 1;
  const slot = Number(formData.get("slot")) || 0;
  const updated = await prisma.psMatch.update({
    where: { id },
    data: { round, slot, ...parseMatch(formData) },
  });
  await advanceWinner(updated);
  revalidateAll();
}

async function deleteMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.psMatch.delete({ where: { id } });
    revalidateAll();
  }
}

async function resetTournament() {
  "use server";
  await prisma.psMatch.deleteMany({});
  revalidateAll();
}

// --- Fase de grupos ---
async function addGroupTeam(formData) {
  "use server";
  const groupName = formData.get("groupName")?.trim();
  const teamName = formData.get("teamName")?.trim();
  if (groupName && teamName) {
    await prisma.psGroupTeam.create({ data: { groupName, teamName } });
    revalidateAll();
  }
}

async function updateGroupTeam(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const teamName = formData.get("teamName")?.trim();
  const groupName = formData.get("groupName")?.trim();
  const played = Number(formData.get("played")) || 0;
  const wins = Number(formData.get("wins")) || 0;
  const draws = Number(formData.get("draws")) || 0;
  const losses = Number(formData.get("losses")) || 0;
  const points = Number(formData.get("points")) || 0;
  const classified = !!formData.get("classified");
  if (id && teamName && groupName) {
    await prisma.psGroupTeam.update({
      where: { id },
      data: { teamName, groupName, played, wins, draws, losses, points, classified },
    });
    revalidateAll();
  }
}

async function deleteGroupTeam(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.psGroupTeam.delete({ where: { id } });
    revalidateAll();
  }
}

export default async function AdminPlaystation() {
  const [matches, groupTeams] = await Promise.all([
    prisma.psMatch.findMany({ orderBy: [{ round: "asc" }, { slot: "asc" }] }),
    prisma.psGroupTeam.findMany({ orderBy: [{ groupName: "asc" }, { wins: "desc" }, { points: "desc" }] }),
  ]);

  const groupNames = [...new Set(groupTeams.map((t) => t.groupName))].sort();

  return (
    <div>
      <AdminPageTitle
        icon="stadia_controller"
        title="Torneo EA SPORTS FC"
        description="Escribe los equipos/participantes a mano en cada enfrentamiento. Los puntos de esta competición se ponen manualmente en la Clasificación General (Ajuste manual de cada equipo)."
      />

      {/* Reiniciar torneo */}
      <div className="mb-8 flex items-center justify-between border border-error-container bg-error-container/10 p-4">
        <div>
          <p className="label-caps text-error">Zona de riesgo</p>
          <p className="text-sm text-on-surface-variant">Elimina todos los enfrentamientos (conserva los participantes).</p>
        </div>
        <form action={resetTournament}>
          <ConfirmButton icon="restart_alt" message="¿Reiniciar el torneo? Se eliminarán todos los enfrentamientos.">
            Reiniciar torneo
          </ConfirmButton>
        </form>
      </div>

      {/* Fase de grupos */}
      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Fase de Grupos</h2>
        <form action={addGroupTeam} className={`${s.panelPad} mb-4 grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-end`}>
          <div>
            <label className={s.label}>Grupo</label>
            <input name="groupName" list="grupos-fifa" placeholder="Grupo 1" required className={s.input} />
            <datalist id="grupos-fifa">
              {groupNames.map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <label className={s.label}>Equipo/Participante</label>
            <input name="teamName" required className={s.input} />
          </div>
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Añadir al grupo</span>
          </button>
        </form>

        {groupNames.map((g) => (
          <div key={g} className="mb-6">
            <h3 className="font-display text-lg font-bold text-on-surface">{g}</h3>
            <p className="mb-2 text-xs text-on-surface-variant">
              Orden por victorias y puntos. Marca &quot;Clasifica&quot; a mano cuando acabe la fase (se resalta en la web).
            </p>
            <div className="space-y-2">
              {groupTeams.filter((t) => t.groupName === g).map((t, i) => (
                <div key={t.id} className={s.panelPad}>
                  <form action={updateGroupTeam} className="grid gap-3 md:grid-cols-[auto_minmax(120px,1fr)_repeat(5,64px)_auto_auto] md:items-end">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="groupName" value={t.groupName} />
                    <span className="data-mono self-center pt-4 text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <label className={s.label}>Equipo/Participante</label>
                      <input name="teamName" defaultValue={t.teamName} required className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>PJ</label>
                      <input name="played" type="number" min="0" defaultValue={t.played} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>V</label>
                      <input name="wins" type="number" min="0" defaultValue={t.wins} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>E</label>
                      <input name="draws" type="number" min="0" defaultValue={t.draws} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>D</label>
                      <input name="losses" type="number" min="0" defaultValue={t.losses} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>Pts</label>
                      <input name="points" type="number" defaultValue={t.points} className={s.input} />
                    </div>
                    <label className="flex items-center gap-2 pb-2 md:pb-2.5">
                      <input name="classified" type="checkbox" defaultChecked={t.classified} className="h-4 w-4 accent-[var(--color-tertiary)]" />
                      <span className="label-caps text-on-surface-variant">Clasifica</span>
                    </label>
                    <button type="submit" className={s.btnAccent}>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="label-caps">Guardar</span>
                    </button>
                  </form>
                  <div className="mt-2 flex justify-end">
                    <form action={deleteGroupTeam}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton message={`¿Quitar "${t.teamName}" del ${t.groupName}?`}>Quitar</ConfirmButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {groupTeams.length === 0 && (
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>
            Aún no hay grupos. Añade equipos escribiendo un nombre de grupo (p. ej. &quot;Grupo 1&quot;) y el equipo.
          </p>
        )}
      </section>

      {/* Enfrentamientos */}
      <section>
        <h2 className="label-caps mb-4 text-tertiary">Cuadro y Resultados</h2>
        <details className="mb-4">
          <summary className={`${s.btnPrimary} cursor-pointer list-none`}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Nuevo Enfrentamiento</span>
          </summary>
          <form action={addMatch} className={`${s.panelPad} mt-3 grid gap-3 md:grid-cols-2`}>
            <div className="md:col-span-2">
              <label className={s.label}>Fase (agrupa el partido en el cuadro)</label>
              <select name="roundLabel" defaultValue="" className={s.input}>
                <option value="">— Automática (por número de ronda) —</option>
                {BRACKET_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={s.label}>Ronda (nº, orden)</label>
              <input name="round" type="number" min="1" defaultValue={1} className={s.input} />
            </div>
            <div>
              <label className={s.label}>Posición</label>
              <input name="slot" type="number" min="0" defaultValue={0} className={s.input} />
            </div>
            <div>
              <label className={s.label}>Participante/Equipo A</label>
              <input name="playerAName" placeholder="Nombre" className={s.input} />
            </div>
            <div>
              <label className={s.label}>Participante/Equipo B</label>
              <input name="playerBName" placeholder="Nombre" className={s.input} />
            </div>
            <div>
              <label className={s.label}>Estado</label>
              <select name="status" defaultValue="Pendiente" className={s.input}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e === "EnJuego" ? "En Juego" : e}</option>)}
              </select>
            </div>
            <div>
              <label className={s.label}>Hora</label>
              <input name="scheduledTime" type="time" className={s.input} />
            </div>
            <div className="md:col-span-2">
              <label className={s.label}>Lugar</label>
              <input name="field" placeholder="Sala de ocio, sede..." className={s.input} />
            </div>
            <div>
              <label className={s.label}>Goles A</label>
              <input name="scoreA" type="number" min="0" className={s.input} />
            </div>
            <div>
              <label className={s.label}>Goles B</label>
              <input name="scoreB" type="number" min="0" className={s.input} />
            </div>
            <div className="md:col-span-2">
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
                  {m.playerAName || "Por definir"} <span className="text-on-surface-variant">vs</span> {m.playerBName || "Por definir"}
                </span>
              </div>
              <form action={updateMatch} className="space-y-3">
                <input type="hidden" name="id" value={m.id} />
                <div>
                  <label className={s.label}>Fase (agrupa el partido en el cuadro)</label>
                  <select name="roundLabel" defaultValue={m.roundLabel ?? ""} className={s.input}>
                    <option value="">— Automática (por número de ronda) —</option>
                    {BRACKET_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className={s.label}>Ronda (nº, orden)</label>
                    <input name="round" type="number" min="1" defaultValue={m.round} className={s.input} />
                  </div>
                  <div>
                    <label className={s.label}>Posición</label>
                    <input name="slot" type="number" min="0" defaultValue={m.slot} className={s.input} />
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
                <div>
                  <label className={s.label}>Lugar</label>
                  <input name="field" defaultValue={m.field ?? ""} placeholder="Sala de ocio, sede..." className={s.input} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={s.label}>Participante/Equipo A</label>
                    <input name="playerAName" defaultValue={m.playerAName ?? ""} placeholder="Nombre" className={s.input} />
                  </div>
                  <div>
                    <label className={s.label}>Participante/Equipo B</label>
                    <input name="playerBName" defaultValue={m.playerBName ?? ""} placeholder="Nombre" className={s.input} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={s.label}>Goles A</label>
                    <input name="scoreA" type="number" min="0" defaultValue={m.scoreA ?? ""} className={s.input} />
                  </div>
                  <div>
                    <label className={s.label}>Goles B</label>
                    <input name="scoreB" type="number" min="0" defaultValue={m.scoreB ?? ""} className={s.input} />
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
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay enfrentamientos. Crea el cuadro.</p>
          )}
        </div>
      </section>
    </div>
  );
}
