import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import AdminPageTitle from "@/components/AdminPageTitle";
import ConfirmButton from "@/components/ConfirmButton";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

function revalidateAll() {
  revalidatePath("/admin/calendario");
  revalidatePath("/");
}

async function addActivity(formData) {
  "use server";
  const name = formData.get("name")?.trim();
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location")?.trim();
  const description = formData.get("description")?.trim() || null;
  if (name && date && time && location) {
    await prisma.activity.create({ data: { name, date, time, location, description } });
    revalidateAll();
  }
}

async function updateActivity(formData) {
  "use server";
  const id = parseInt(formData.get("id"));
  const name = formData.get("name")?.trim();
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location")?.trim();
  const description = formData.get("description")?.trim() || null;
  if (id && name && date && time && location) {
    await prisma.activity.update({ where: { id }, data: { name, date, time, location, description } });
    revalidateAll();
  }
}

async function deleteActivity(formData) {
  "use server";
  const id = parseInt(formData.get("id"));
  if (id) {
    await prisma.activity.delete({ where: { id } });
    revalidateAll();
  }
}

export default async function AdminCalendario() {
  const activities = await prisma.activity.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return (
    <div>
      <AdminPageTitle
        icon="calendar_month"
        title="Gestión del Calendario"
        description="Añade, edita y elimina las actividades del evento."
      />

      <form action={addActivity} className={`${s.panelPad} mb-8 grid gap-3 md:grid-cols-2`}>
        <div>
          <label className={s.label}>Fecha</label>
          <input type="date" name="date" required className={s.input} />
        </div>
        <div>
          <label className={s.label}>Hora</label>
          <input type="time" name="time" required className={s.input} />
        </div>
        <div>
          <label className={s.label}>Actividad</label>
          <input type="text" name="name" required className={s.input} />
        </div>
        <div>
          <label className={s.label}>Lugar</label>
          <input type="text" name="location" required className={s.input} />
        </div>
        <div className="md:col-span-2">
          <label className={s.label}>Descripción (opcional)</label>
          <input type="text" name="description" className={s.input} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className={s.btnPrimary}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="label-caps">Añadir Actividad</span>
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className={s.panelPad}>
            <form action={updateActivity} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={act.id} />
              <div>
                <label className={s.label}>Fecha</label>
                <input type="date" name="date" defaultValue={act.date} required className={s.input} />
              </div>
              <div>
                <label className={s.label}>Hora</label>
                <input type="time" name="time" defaultValue={act.time} required className={s.input} />
              </div>
              <div>
                <label className={s.label}>Actividad</label>
                <input type="text" name="name" defaultValue={act.name} required className={s.input} />
              </div>
              <div>
                <label className={s.label}>Lugar</label>
                <input type="text" name="location" defaultValue={act.location} required className={s.input} />
              </div>
              <div className="md:col-span-2">
                <label className={s.label}>Descripción</label>
                <input type="text" name="description" defaultValue={act.description || ""} className={s.input} />
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <button type="submit" className={s.btnAccent}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="label-caps">Guardar</span>
                </button>
              </div>
            </form>
            <div className="mt-3 flex justify-end border-t border-outline-variant pt-3">
              <form action={deleteActivity}>
                <input type="hidden" name="id" value={act.id} />
                <ConfirmButton message={`¿Eliminar la actividad "${act.name}"?`}>Eliminar</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className={`${s.panelPad} text-center text-on-surface-variant`}>No hay actividades programadas.</p>
        )}
      </div>
    </div>
  );
}
