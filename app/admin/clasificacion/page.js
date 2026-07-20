import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getGeneralStandings, recomputeTeamTotals } from "@/lib/standings";
import AdminPageTitle from "@/components/AdminPageTitle";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

async function updateTeamMeta(formData) {
  "use server";
  const id = parseInt(formData.get("id"));
  const manualAdjust = parseInt(formData.get("manualAdjust")) || 0;
  const observations = formData.get("observations")?.trim() || null;
  if (id) {
    await prisma.team.update({ where: { id }, data: { manualAdjust, observations } });
    await recomputeTeamTotals();
    revalidatePath("/admin/clasificacion");
    revalidatePath("/clasificacion");
  }
}

export default async function AdminClasificacion() {
  const standings = await getGeneralStandings();

  return (
    <div>
      <AdminPageTitle
        icon="emoji_events"
        title="Clasificación General"
        description="CrossFit y Paellas se suman automáticamente. Los puntos de Cross, Vóley y FIFA26 añádelos en el 'Ajuste manual' de cada equipo. También puedes escribir observaciones."
      />

      <div className="space-y-4">
        {standings.map((t, i) => (
          <div key={t.id} className={s.panelPad}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-3">
                <span className="data-mono text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-lg font-bold text-on-surface">{t.name}</span>
              </div>
              <span className="data-mono border border-tertiary px-3 py-1 text-tertiary">{t.totalPoints} pts</span>
            </div>

            {/* Desglose por competición */}
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {[
                ["CrossFit", t.breakdown.crossfit],
                ["Paellas", t.breakdown.paellas],
                ["Ajuste manual", t.manualAdjust],
              ].map(([label, val]) => (
                <span key={label} className="border border-outline-variant px-2 py-1 text-on-surface-variant">
                  {label}: <span className="data-mono text-on-surface">{val}</span>
                </span>
              ))}
            </div>

            <form action={updateTeamMeta} className="grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-end">
              <input type="hidden" name="id" value={t.id} />
              <div>
                <label className={s.label}>Ajuste manual</label>
                <input name="manualAdjust" type="number" defaultValue={t.manualAdjust} className={s.input} />
              </div>
              <div>
                <label className={s.label}>Observaciones</label>
                <input name="observations" defaultValue={t.observations || ""} className={s.input} />
              </div>
              <button type="submit" className={s.btnAccent}>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span className="label-caps">Guardar</span>
              </button>
            </form>
          </div>
        ))}
        {standings.length === 0 && (
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay equipos registrados.</p>
        )}
      </div>
    </div>
  );
}
