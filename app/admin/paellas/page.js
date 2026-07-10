import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

// Criterios de puntuación del concurso de paellas.
const CRITERIOS = [
  { key: "sabor", label: "Sabor" },
  { key: "puntoArroz", label: "Punto del arroz" },
  { key: "presentacion", label: "Presentación" },
  { key: "color", label: "Color" },
];

function revalidateAll() {
  revalidatePath("/admin/paellas");
  revalidatePath("/paellas");
  revalidatePath("/clasificacion");
  revalidatePath("/");
}

function parseCriterios(formData) {
  const data = {};
  let totalPoints = 0;
  for (const c of CRITERIOS) {
    const v = Number(formData.get(c.key)) || 0;
    data[c.key] = v;
    totalPoints += v;
  }
  data.totalPoints = totalPoints;
  return data;
}

async function addResult(formData) {
  "use server";
  const teamId = Number(formData.get("teamId"));
  const data = parseCriterios(formData);
  if (teamId) {
    await prisma.paellaResult.upsert({
      where: { teamId },
      update: data,
      create: { teamId, ...data },
    });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function updateResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const data = parseCriterios(formData);
  if (id) {
    await prisma.paellaResult.update({ where: { id }, data });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

async function deleteResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.paellaResult.delete({ where: { id } });
    await recomputeTeamTotals();
    revalidateAll();
  }
}

export default async function AdminPaellas() {
  const [teams, results] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.paellaResult.findMany({ include: { team: true }, orderBy: { totalPoints: "desc" } }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="skillet"
        title="Gestión del Concurso de Paellas"
        description="Un resultado por equipo. El total es la suma de los cuatro criterios y se suma a la clasificación general."
      />

      <form action={addResult} className={`${s.panelPad} mb-8 grid gap-3 md:grid-cols-3`}>
        <div className="md:col-span-3">
          <label className={s.label}>Equipo</label>
          <select name="teamId" required className={s.input}>
            <option value="">Seleccionar equipo</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {CRITERIOS.map((c) => (
          <div key={c.key}>
            <label className={s.label}>{c.label}</label>
            <input type="number" name={c.key} defaultValue={0} className={s.input} />
          </div>
        ))}
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
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-on-surface">{r.team?.name}</span>
              <span className="data-mono border border-outline-variant px-2 py-1 text-sm text-tertiary">
                {r.totalPoints} pts
              </span>
            </div>
            <form action={updateResult} className="grid gap-3 md:grid-cols-3 md:items-end">
              <input type="hidden" name="id" value={r.id} />
              {CRITERIOS.map((c) => (
                <div key={c.key}>
                  <label className={s.label}>{c.label}</label>
                  <input name={c.key} type="number" defaultValue={r[c.key]} className={s.input} />
                </div>
              ))}
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
