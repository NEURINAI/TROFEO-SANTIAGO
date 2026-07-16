import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";
import { BRACKET_PHASES } from "@/lib/phases";

export const dynamic = "force-dynamic";

const ESTADOS = ["Pendiente", "EnJuego", "Finalizado"];

function revalidateAll() {
  revalidatePath("/admin/voley");
  revalidatePath("/voley");
}

function parseMatch(formData) {
  return {
    round: Number(formData.get("round")) || 1,
    roundLabel: formData.get("roundLabel")?.trim() || null,
    slot: Number(formData.get("slot")) || 0,
    teamAName: formData.get("teamAName")?.trim() || null,
    teamBName: formData.get("teamBName")?.trim() || null,
    result: formData.get("result")?.trim() || null,
    status: formData.get("status") || "Pendiente",
    scheduledDate: formData.get("scheduledDate") || null,
    scheduledTime: formData.get("scheduledTime") || null,
    field: formData.get("field")?.trim() || null,
    winnerName: formData.get("winnerName")?.trim() || null,
  };
}

async function addMatch(formData) {
  "use server";
  await prisma.volleyMatch.create({ data: parseMatch(formData) });
  revalidateAll();
}

async function updateMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.volleyMatch.update({ where: { id }, data: parseMatch(formData) });
  revalidateAll();
}

async function deleteMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.volleyMatch.delete({ where: { id } });
    revalidateAll();
  }
}

// --- Fase de grupos ---
async function addGroupTeam(formData) {
  "use server";
  const groupName = formData.get("groupName")?.trim();
  const teamName = formData.get("teamName")?.trim();
  if (groupName && teamName) {
    await prisma.volleyGroupTeam.create({ data: { groupName, teamName } });
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
  const points = Number(formData.get("points")) || 0;
  const classified = !!formData.get("classified");
  if (id && teamName && groupName) {
    await prisma.volleyGroupTeam.update({
      where: { id },
      data: { teamName, groupName, played, wins, points, classified },
    });
    revalidateAll();
  }
}

async function deleteGroupTeam(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.volleyGroupTeam.delete({ where: { id } });
    revalidateAll();
  }
}

function MatchFields({ m }) {
  return (
    <>
      <div>
        <label className={s.label}>Fase (agrupa el partido en el cuadro)</label>
        <select name="roundLabel" defaultValue={m?.roundLabel ?? ""} className={s.input}>
          <option value="">— Automática (por número de ronda) —</option>
          {BRACKET_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className={s.label}>Ronda (nº, orden)</label>
          <input name="round" type="number" min="1" defaultValue={m?.round ?? 1} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Posición</label>
          <input name="slot" type="number" min="0" defaultValue={m?.slot ?? 0} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Estado</label>
          <select name="status" defaultValue={m?.status ?? "Pendiente"} className={s.input}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e === "EnJuego" ? "En Juego" : e}</option>)}
          </select>
        </div>
        <div>
          <label className={s.label}>Campo</label>
          <input name="field" defaultValue={m?.field ?? ""} className={s.input} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={s.label}>Equipo A</label>
          <input name="teamAName" defaultValue={m?.teamAName ?? ""} placeholder="Nombre del equipo" className={s.input} />
        </div>
        <div>
          <label className={s.label}>Equipo B</label>
          <input name="teamBName" defaultValue={m?.teamBName ?? ""} placeholder="Nombre del equipo" className={s.input} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={s.label}>Resultado (sets)</label>
          <input name="result" placeholder="2-1" defaultValue={m?.result ?? ""} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Ganador (nombre)</label>
          <input name="winnerName" defaultValue={m?.winnerName ?? ""} placeholder="Equipo ganador" className={s.input} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={s.label}>Fecha</label>
          <input name="scheduledDate" type="date" defaultValue={m?.scheduledDate ?? ""} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Hora</label>
          <input name="scheduledTime" type="time" defaultValue={m?.scheduledTime ?? ""} className={s.input} />
        </div>
      </div>
    </>
  );
}

export default async function AdminVoley() {
  const [matches, groupTeams] = await Promise.all([
    prisma.volleyMatch.findMany({ orderBy: [{ round: "asc" }, { slot: "asc" }] }),
    prisma.volleyGroupTeam.findMany({ orderBy: [{ groupName: "asc" }, { wins: "desc" }, { points: "desc" }] }),
  ]);

  const groupNames = [...new Set(groupTeams.map((t) => t.groupName))].sort();

  return (
    <div>
      <AdminPageTitle
        icon="sports_volleyball"
        title="Gestión de Vóley"
        description="Fase de grupos (victorias y puntos) + cuadro eliminatorio con equipos escritos a mano. Los puntos de esta competición se ponen manualmente en la Clasificación General."
      />

      {/* Fase de grupos */}
      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Fase de Grupos</h2>
        <form action={addGroupTeam} className={`${s.panelPad} mb-4 grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-end`}>
          <div>
            <label className={s.label}>Grupo</label>
            <input name="groupName" list="grupos-voley" placeholder="Grupo 1" required className={s.input} />
            <datalist id="grupos-voley">
              {groupNames.map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <label className={s.label}>Equipo</label>
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
                  <form action={updateGroupTeam} className="grid gap-3 md:grid-cols-[auto_1fr_84px_84px_84px_auto_auto] md:items-end">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="groupName" value={t.groupName} />
                    <span className="data-mono self-center pt-4 text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <label className={s.label}>Equipo</label>
                      <input name="teamName" defaultValue={t.teamName} required className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>Jugados</label>
                      <input name="played" type="number" min="0" defaultValue={t.played} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>Victorias</label>
                      <input name="wins" type="number" min="0" defaultValue={t.wins} className={s.input} />
                    </div>
                    <div>
                      <label className={s.label}>Puntos</label>
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
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>Aún no hay equipos en grupos.</p>
        )}
      </section>

      <h2 className="label-caps mb-4 text-tertiary">Cuadro Eliminatorio</h2>
      <details className="mb-8">
        <summary className={`${s.btnPrimary} cursor-pointer list-none`}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="label-caps">Nuevo Enfrentamiento</span>
        </summary>
        <form action={addMatch} className={`${s.panelPad} mt-3 space-y-3`}>
          <MatchFields m={null} />
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span className="label-caps">Crear Enfrentamiento</span>
          </button>
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
                {m.teamAName || "Por definir"} <span className="text-on-surface-variant">vs</span> {m.teamBName || "Por definir"}
              </span>
            </div>
            <form action={updateMatch} className="space-y-3">
              <input type="hidden" name="id" value={m.id} />
              <MatchFields m={m} />
              <div className="border-t border-outline-variant pt-3">
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Actualizar</span>
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
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay enfrentamientos registrados.</p>
        )}
      </div>
    </div>
  );
}
