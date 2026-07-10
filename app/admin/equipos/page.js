import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

function revalidateAll() {
  revalidatePath("/admin/equipos");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

async function addTeam(formData) {
  "use server";
  const name = formData.get("name")?.trim();
  if (name) {
    await prisma.team.create({ data: { name } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function updateTeam(formData) {
  "use server";
  const id = parseInt(formData.get("id"));
  const name = formData.get("name")?.trim();
  const manualAdjust = parseInt(formData.get("manualAdjust")) || 0;
  const observations = formData.get("observations")?.trim() || null;
  if (id && name) {
    await prisma.team.update({ where: { id }, data: { name, manualAdjust, observations } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function deleteTeam(formData) {
  "use server";
  const id = parseInt(formData.get("id"));
  if (!id) return;
  // Liberar referencias sin cascada antes de eliminar el equipo.
  await prisma.volleyMatch.updateMany({ where: { teamAId: id }, data: { teamAId: null } });
  await prisma.volleyMatch.updateMany({ where: { teamBId: id }, data: { teamBId: null } });
  await prisma.psPlayer.updateMany({ where: { teamId: id }, data: { teamId: null } });
  await prisma.team.delete({ where: { id } });
  await recomputeTeamTotals();
  revalidateAll();
}

export default async function AdminEquipos() {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageTitle
        icon="groups"
        title="Gestión de Equipos"
        description="Crea, edita y elimina equipos. El total se calcula automáticamente sumando todas las competiciones más el ajuste manual."
      />

      <form action={addTeam} className={`${s.panelPad} mb-8 flex flex-col gap-3 sm:flex-row sm:items-end`}>
        <div className="flex-1">
          <label className={s.label}>Nuevo equipo</label>
          <input type="text" name="name" placeholder="Nombre del equipo" required className={s.input} />
        </div>
        <button type="submit" className={s.btnPrimary}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="label-caps">Añadir</span>
        </button>
      </form>

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className={s.panelPad}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="data-mono text-tertiary">#{team.id}</span>
                <span className="font-display text-lg font-bold text-on-surface">{team.name}</span>
              </div>
              <span className="data-mono border border-outline-variant px-2 py-1 text-sm text-on-surface">
                {team.totalPoints} pts
              </span>
            </div>
            <form action={updateTeam} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
              <input type="hidden" name="id" value={team.id} />
              <div>
                <label className={s.label}>Nombre</label>
                <input name="name" defaultValue={team.name} required className={s.input} />
              </div>
              <div>
                <label className={s.label}>Ajuste manual</label>
                <input name="manualAdjust" type="number" defaultValue={team.manualAdjust} className={s.input} />
              </div>
              <div className="flex items-end">
                <button type="submit" className={`${s.btnAccent} w-full`}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Guardar</span>
                </button>
              </div>
              <div className="md:col-span-3">
                <label className={s.label}>Observaciones</label>
                <input name="observations" defaultValue={team.observations || ""} placeholder="Notas visibles en la clasificación" className={s.input} />
              </div>
            </form>
            <div className="mt-3 flex justify-end border-t border-outline-variant pt-3">
              <form action={deleteTeam}>
                <input type="hidden" name="id" value={team.id} />
                <ConfirmButton message={`¿Eliminar el equipo "${team.name}"? Se borrarán sus resultados asociados.`}>
                  Eliminar equipo
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay equipos. Añade el primero.</p>
        )}
      </div>
    </div>
  );
}
