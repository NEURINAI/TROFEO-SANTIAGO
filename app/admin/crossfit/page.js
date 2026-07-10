import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

function revalidateAll() {
  revalidatePath("/admin/crossfit");
  revalidatePath("/crossfit");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

async function addResult(formData) {
  "use server";
  const teamId = Number(formData.get("teamId"));
  const time = formData.get("time")?.trim() || null;
  const points = Number(formData.get("points")) || 0;
  if (teamId) {
    // 1 resultado por equipo (teamId es único)
    await prisma.crossfitResult.upsert({
      where: { teamId },
      update: { time, points },
      create: { teamId, time, points },
    });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function updateResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const time = formData.get("time")?.trim() || null;
  const points = Number(formData.get("points")) || 0;
  if (id) {
    await prisma.crossfitResult.update({ where: { id }, data: { time, points } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function deleteResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.crossfitResult.delete({ where: { id } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

export default async function AdminCrossfit() {
  const [teams, results] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.crossfitResult.findMany({ include: { team: true }, orderBy: { points: "desc" } }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="fitness_center"
        title="Gestión de CrossFit"
        description="Un resultado por equipo. Los puntos se suman automáticamente a la clasificación general."
      />

      <form action={addResult} className={`${s.panelPad} mb-8 grid gap-3 md:grid-cols-3`}>
        <div>
          <label className={s.label}>Equipo</label>
          <select name="teamId" required className={s.input}>
            <option value="">Seleccionar equipo</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className={s.label}>Tiempo (HH:MM:SS)</label>
          <input type="text" name="time" placeholder="00:12:45" className={s.input} />
        </div>
        <div>
          <label className={s.label}>Puntos</label>
          <input type="number" name="points" defaultValue={0} className={s.input} />
        </div>
        <div className="md:col-span-3">
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Guardar Resultado</span>
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.id} className={s.panelPad}>
            <div className="mb-3 font-display text-lg font-bold text-on-surface">{r.team?.name}</div>
            <form action={updateResult} className="grid gap-3 md:grid-cols-3 md:items-end">
              <input type="hidden" name="id" value={r.id} />
              <div>
                <label className={s.label}>Tiempo (HH:MM:SS)</label>
                <input name="time" type="text" defaultValue={r.time || ""} placeholder="00:12:45" className={s.input} />
              </div>
              <div>
                <label className={s.label}>Puntos</label>
                <input name="points" type="number" defaultValue={r.points} className={s.input} />
              </div>
              <button type="submit" className={s.btnAccent}>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span className="label-caps">Actualizar</span>
              </button>
            </form>
            <div className="mt-3 flex justify-end border-t border-outline-variant pt-3">
              <form action={deleteResult}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton>Eliminar</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay resultados registrados.</p>
        )}
      </div>
    </div>
  );
}
