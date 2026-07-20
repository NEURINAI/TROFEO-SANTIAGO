import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

function revalidateAll() {
  revalidatePath("/admin/cross");
  revalidatePath("/cross");
}

// --- Resultados individuales ---
function parseResult(formData) {
  return {
    empleo: formData.get("empleo")?.trim() || null,
    individualName: formData.get("individualName")?.trim() || null,
    puesto: formData.get("puesto") !== "" ? Number(formData.get("puesto")) : null,
    time: formData.get("time")?.trim() || null,
    dorsal: formData.get("dorsal")?.trim() || null,
    unitName: formData.get("unitName")?.trim() || null,
  };
}

async function addResult(formData) {
  "use server";
  const data = parseResult(formData);
  if (data.individualName) {
    await prisma.crossResult.create({ data });
    revalidateAll();
  }
}

async function updateResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.crossResult.update({ where: { id }, data: parseResult(formData) });
    revalidateAll();
  }
}

async function deleteResult(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.crossResult.delete({ where: { id } });
    revalidateAll();
  }
}

// --- Clasificación por equipos ---
async function addTeam(formData) {
  "use server";
  const unitName = formData.get("unitName")?.trim();
  const points = Number(formData.get("points")) || 0;
  const position = Number(formData.get("position")) || 0;
  if (unitName) {
    await prisma.crossTeamResult.create({ data: { unitName, points, position } });
    revalidateAll();
  }
}

async function updateTeam(formData) {
  "use server";
  const id = Number(formData.get("id"));
  const unitName = formData.get("unitName")?.trim();
  const points = Number(formData.get("points")) || 0;
  const position = Number(formData.get("position")) || 0;
  if (id && unitName) {
    await prisma.crossTeamResult.update({ where: { id }, data: { unitName, points, position } });
    revalidateAll();
  }
}

async function deleteTeam(formData) {
  "use server";
  const id = Number(formData.get("id"));
  if (id) {
    await prisma.crossTeamResult.delete({ where: { id } });
    revalidateAll();
  }
}

function ResultFields({ r }) {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <div>
        <label className={s.label}>Puesto</label>
        <input name="puesto" type="number" min="1" defaultValue={r?.puesto ?? ""} className={s.input} />
      </div>
      <div>
        <label className={s.label}>Empleo</label>
        <input name="empleo" defaultValue={r?.empleo ?? ""} placeholder="SGTO" className={s.input} />
      </div>
      <div className="md:col-span-2">
        <label className={s.label}>Apellidos y nombre</label>
        <input name="individualName" defaultValue={r?.individualName ?? ""} required className={s.input} />
      </div>
      <div>
        <label className={s.label}>Tiempo</label>
        <input name="time" defaultValue={r?.time ?? ""} placeholder="24:18" className={s.input} />
      </div>
      <div>
        <label className={s.label}>Dorsal</label>
        <input name="dorsal" defaultValue={r?.dorsal ?? ""} className={s.input} />
      </div>
      <div className="md:col-span-2">
        <label className={s.label}>Unidad</label>
        <input name="unitName" defaultValue={r?.unitName ?? ""} placeholder="UTRANS" className={s.input} />
      </div>
    </div>
  );
}

export default async function AdminCross() {
  const [results, teams] = await Promise.all([
    prisma.crossResult.findMany({ orderBy: [{ puesto: "asc" }, { id: "asc" }] }),
    prisma.crossTeamResult.findMany({ orderBy: [{ position: "asc" }, { points: "asc" }] }),
  ]);

  return (
    <div>
      <AdminPageTitle
        icon="directions_run"
        title="Gestión de Cross"
        description="Clasificación individual y por equipos. La puntuación del Cross se lleva manualmente a la Clasificación General (Ajuste manual de cada equipo)."
      />

      {/* Clasificación por equipos */}
      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Clasificación por Equipos</h2>
        <form action={addTeam} className={`${s.panelPad} mb-4 grid gap-3 md:grid-cols-[80px_1fr_100px_auto] md:items-end`}>
          <div>
            <label className={s.label}>Clasif.</label>
            <input name="position" type="number" min="1" placeholder="1" className={s.input} />
          </div>
          <div>
            <label className={s.label}>Unidad</label>
            <input name="unitName" required className={s.input} />
          </div>
          <div>
            <label className={s.label}>Puntos</label>
            <input name="points" type="number" className={s.input} />
          </div>
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Añadir</span>
          </button>
        </form>
        <div className="space-y-2">
          {teams.map((t) => (
            <div key={t.id} className={`${s.panelPad} flex flex-col gap-3 md:flex-row md:items-end`}>
              <form action={updateTeam} className="grid flex-1 gap-3 md:grid-cols-[80px_1fr_100px_auto] md:items-end">
                <input type="hidden" name="id" value={t.id} />
                <div>
                  <label className={s.label}>Clasif.</label>
                  <input name="position" type="number" min="1" defaultValue={t.position} className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Unidad</label>
                  <input name="unitName" defaultValue={t.unitName} required className={s.input} />
                </div>
                <div>
                  <label className={s.label}>Puntos</label>
                  <input name="points" type="number" defaultValue={t.points} className={s.input} />
                </div>
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Guardar</span>
                </button>
              </form>
              <form action={deleteTeam}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmButton message={`¿Quitar "${t.unitName}"?`}>Quitar</ConfirmButton>
              </form>
            </div>
          ))}
          {teams.length === 0 && (
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>Sin equipos.</p>
          )}
        </div>
      </section>

      {/* Resultados individuales */}
      <section>
        <h2 className="label-caps mb-4 text-tertiary">Clasificación Individual</h2>
        <details className="mb-4">
          <summary className={`${s.btnPrimary} cursor-pointer list-none`}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Nuevo corredor</span>
          </summary>
          <form action={addResult} className={`${s.panelPad} mt-3 space-y-3`}>
            <ResultFields r={null} />
            <button type="submit" className={s.btnPrimary}>
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span className="label-caps">Guardar</span>
            </button>
          </form>
        </details>

        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id} className={s.panelPad}>
              <form action={updateResult} className="space-y-3">
                <input type="hidden" name="id" value={r.id} />
                <ResultFields r={r} />
                <div className="border-t border-outline-variant pt-3">
                  <button type="submit" className={s.btnAccent}>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span className="label-caps">Actualizar</span>
                  </button>
                </div>
              </form>
              <div className="mt-2 flex justify-end">
                <form action={deleteResult}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton>Eliminar</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay corredores registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
