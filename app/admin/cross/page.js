import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

function revalidateAll() {
  revalidatePath("/admin/cross");
  revalidatePath("/cross");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

async function addResult(formData) {
  "use server";
  const teamId = Number(formData.get("teamId"));
  const individualName = formData.get("individualName")?.trim();
  const time = formData.get("time")?.trim();
  const points = Number(formData.get("points")) || 0;
  if (teamId) {
    await prisma.crossResult.create({ data: { teamId, individualName, time, points } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function updateResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const teamId = Number(formData.get("teamId"));
  const individualName = formData.get("individualName")?.trim();
  const time = formData.get("time")?.trim();
  const points = Number(formData.get("points")) || 0;
  if (id) {
    await prisma.crossResult.update({ where: { id }, data: { teamId, individualName, time, points } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function deleteResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.crossResult.delete({ where: { id } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

export default async function AdminCross() {
  const [teams, results] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.crossResult.findMany({ include: { team: true }, orderBy: { points: "desc" } }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="directions_run"
        title="Gestión de Cross"
        description="Resultados individuales. Los puntos se suman automáticamente a la clasificación general."
      />

      <form action={addResult} className={`${s.panelPad} mb-8 grid gap-3 md:grid-cols-2`}>
        <div>
          <label className={s.label}>Equipo</label>
          <select name="teamId" required className={s.input}>
            <option value="">Seleccionar equipo</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className={s.label}>Atleta</label>
          <input type="text" name="individualName" required className={s.input} />
        </div>
        <div>
          <label className={s.label}>Tiempo (HH:MM:SS)</label>
          <input type="text" name="time" placeholder="00:18:32" className={s.input} />
        </div>
        <div>
          <label className={s.label}>Puntos</label>
          <input type="number" name="points" defaultValue={0} className={s.input} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Guardar Resultado</span>
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.id} className={s.panelPad}>
            <form action={updateResult} className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="id" value={r.id} />
              <div>
                <label className={s.label}>Equipo</label>
                <select name="teamId" defaultValue={r.teamId} required className={s.input}>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className={s.label}>Atleta</label>
                <input name="individualName" defaultValue={r.individualName || ""} className={s.input} />
              </div>
              <div>
                <label className={s.label}>Tiempo</label>
                <input name="time" defaultValue={r.time || ""} className={s.input} />
              </div>
              <div>
                <label className={s.label}>Puntos</label>
                <input name="points" type="number" defaultValue={r.points} className={s.input} />
              </div>
              <div className="flex items-center justify-between md:col-span-4">
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Actualizar</span>
                </button>
              </div>
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
