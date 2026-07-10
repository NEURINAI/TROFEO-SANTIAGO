import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

const ESTADOS = ["Pendiente", "EnJuego", "Finalizado"];

function revalidateAll() {
  revalidatePath("/admin/voley");
  revalidatePath("/voley");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

function parseMatch(formData) {
  const num = (k) => {
    const v = formData.get(k);
    return v === "" || v === null ? null : Number(v);
  };
  return {
    round: Number(formData.get("round")) || 1,
    slot: Number(formData.get("slot")) || 0,
    teamAId: num("teamAId"),
    teamBId: num("teamBId"),
    result: formData.get("result")?.trim() || null,
    teamAPoints: Number(formData.get("teamAPoints")) || 0,
    teamBPoints: Number(formData.get("teamBPoints")) || 0,
    status: formData.get("status") || "Pendiente",
    scheduledDate: formData.get("scheduledDate") || null,
    scheduledTime: formData.get("scheduledTime") || null,
    field: formData.get("field")?.trim() || null,
    winnerId: num("winnerId"),
  };
}

async function addMatch(formData) {
  "use server";
  const data = parseMatch(formData);
  await prisma.volleyMatch.create({ data });
  await recomputeTeamTotals();
  revalidateAll();
}

async function updateMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  const data = parseMatch(formData);
  await prisma.volleyMatch.update({ where: { id }, data });
  await recomputeTeamTotals();
  revalidateAll();
}

async function deleteMatch(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.volleyMatch.delete({ where: { id } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

function TeamSelect({ name, teams, defaultValue, placeholder }) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className={s.input}>
      <option value="">{placeholder}</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}

function MatchFields({ teams, m }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className={s.label}>Ronda</label>
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
          <TeamSelect name="teamAId" teams={teams} defaultValue={m?.teamAId} placeholder="Por definir" />
        </div>
        <div>
          <label className={s.label}>Equipo B</label>
          <TeamSelect name="teamBId" teams={teams} defaultValue={m?.teamBId} placeholder="Por definir" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className={s.label}>Resultado (sets)</label>
          <input name="result" placeholder="2-1" defaultValue={m?.result ?? ""} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Puntos A</label>
          <input name="teamAPoints" type="number" defaultValue={m?.teamAPoints ?? 0} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Puntos B</label>
          <input name="teamBPoints" type="number" defaultValue={m?.teamBPoints ?? 0} className={s.input} />
        </div>
        <div>
          <label className={s.label}>Ganador</label>
          <TeamSelect name="winnerId" teams={teams} defaultValue={m?.winnerId} placeholder="Sin definir" />
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
  const [teams, matches] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.volleyMatch.findMany({
      include: { teamA: true, teamB: true },
      orderBy: [{ round: "asc" }, { slot: "asc" }],
    }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="sports_volleyball"
        title="Gestión de Vóley"
        description="Define el cuadro eliminatorio: rondas, enfrentamientos, horarios, campos y resultados."
      />

      <details className="mb-8">
        <summary className={`${s.btnPrimary} cursor-pointer list-none`}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="label-caps">Nuevo Enfrentamiento</span>
        </summary>
        <form action={addMatch} className={`${s.panelPad} mt-3 space-y-3`}>
          <MatchFields teams={teams} m={null} />
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
                {m.teamA?.name || "Por definir"} <span className="text-on-surface-variant">vs</span> {m.teamB?.name || "Por definir"}
              </span>
            </div>
            <form action={updateMatch} className="space-y-3">
              <input type="hidden" name="id" value={m.id} />
              <MatchFields teams={teams} m={m} />
              <div className="flex items-center justify-between border-t border-outline-variant pt-3">
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
