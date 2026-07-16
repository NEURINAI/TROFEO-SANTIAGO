import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { advanceWinner } from "@/lib/ps";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

const ESTADOS = ["Pendiente", "EnJuego", "Finalizado"];

function revalidateAll() {
  revalidatePath("/admin/playstation");
  revalidatePath("/playstation");
}

// --- Participantes (clasificación manual) ---
async function addPlayer(formData) {
  "use server";
  const name = formData.get("name")?.trim();
  const militaryUnit = formData.get("militaryUnit")?.trim() || null;
  const wins = Number(formData.get("wins")) || 0;
  const losses = Number(formData.get("losses")) || 0;
  if (name) {
    await prisma.psPlayer.create({ data: { name, militaryUnit, wins, losses } });
    revalidateAll();
  }
}

async function updatePlayer(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const name = formData.get("name")?.trim();
  const militaryUnit = formData.get("militaryUnit")?.trim() || null;
  const wins = Number(formData.get("wins")) || 0;
  const losses = Number(formData.get("losses")) || 0;
  if (id && name) {
    await prisma.psPlayer.update({ where: { id }, data: { name, militaryUnit, wins, losses } });
    revalidateAll();
  }
}

async function deletePlayer(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.psPlayer.delete({ where: { id } });
    revalidateAll();
  }
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
  return { playerAName, playerBName, scoreA, scoreB, status, scheduledTime, winnerName };
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

export default async function AdminPlaystation() {
  const [players, matches] = await Promise.all([
    prisma.psPlayer.findMany({ orderBy: [{ wins: "desc" }, { name: "asc" }] }),
    prisma.psMatch.findMany({ orderBy: [{ round: "asc" }, { slot: "asc" }] }),
  ]);

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

      {/* Participantes / clasificación manual */}
      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Participantes (clasificación)</h2>
        <form action={addPlayer} className={`${s.panelPad} mb-4 grid gap-3 md:grid-cols-[1fr_1fr_100px_100px_auto] md:items-end`}>
          <div>
            <label className={s.label}>Participante</label>
            <input name="name" required className={s.input} />
          </div>
          <div>
            <label className={s.label}>Equipo</label>
            <input name="militaryUnit" placeholder="Equipo militar" className={s.input} />
          </div>
          <div>
            <label className={s.label}>Victorias</label>
            <input name="wins" type="number" min="0" defaultValue={0} className={s.input} />
          </div>
          <div>
            <label className={s.label}>Derrotas</label>
            <input name="losses" type="number" min="0" defaultValue={0} className={s.input} />
          </div>
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="label-caps">Añadir</span>
          </button>
        </form>

        <div className="space-y-3">
          {players.map((p) => (
            <div key={p.id} className={`${s.panelPad} flex flex-col gap-3 md:flex-row md:items-end`}>
              <form action={updatePlayer} className="grid flex-1 gap-3 md:grid-cols-[1fr_1fr_100px_100px_auto] md:items-end">
                <input type="hidden" name="id" value={p.id} />
                <div>
                  <label className={s.label}>Participante</label>
                  <input name="name" defaultValue={p.name} required className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Equipo</label>
                  <input name="militaryUnit" defaultValue={p.militaryUnit || ""} className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Victorias</label>
                  <input name="wins" type="number" min="0" defaultValue={p.wins} className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Derrotas</label>
                  <input name="losses" type="number" min="0" defaultValue={p.losses} className={s.input} />
                </div>
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Guardar</span>
                </button>
              </form>
              <form action={deletePlayer}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`¿Eliminar a "${p.name}"?`}>Eliminar</ConfirmButton>
              </form>
            </div>
          ))}
          {players.length === 0 && (
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay participantes.</p>
          )}
        </div>
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
            <div>
              <label className={s.label}>Ronda</label>
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
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className={s.label}>Ronda</label>
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
