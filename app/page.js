import { prisma } from "@/lib/prisma";
import { getMediaPath } from "@/lib/media";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatFecha(iso) {
  // iso esperado "YYYY-MM-DD"; si no, se muestra tal cual
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return { dia: iso, mes: "" };
  return { dia: m[3], mes: MESES[Number(m[2]) - 1] || "" };
}

export default async function Home() {
  const [activities, cartel] = await Promise.all([
    prisma.activity.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
    getMediaPath("cartel"),
  ]);

  return (
    <div>
      {/* Hero con cartel oficial */}
      <section className="bg-tactical-noise relative overflow-hidden border-b-2 border-primary-container">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-16 md:px-12 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <p className="label-caps mb-4 text-tertiary">Evento Deportivo Militar</p>
            <h1 className="font-display text-5xl font-bold leading-none text-on-surface md:text-7xl">
              TROFEO DE<br />SANTIAGO
            </h1>
            <p className="mt-4 font-display text-2xl text-secondary">Patrón de Caballería y de España</p>
            <p className="mt-6 max-w-md text-on-surface-variant">
              Toda la información oficial del Trofeo de Santiago: competiciones, clasificaciones,
              calendario y normas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/clasificacion"
                className="inline-flex items-center gap-2 border-2 border-tertiary bg-tertiary px-6 py-3 text-on-tertiary transition-colors hover:bg-tertiary-container"
              >
                <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                <span className="label-caps">Ver Clasificación General</span>
              </Link>
              <Link
                href="/normas"
                className="inline-flex items-center gap-2 border-2 border-primary-container px-6 py-3 text-on-surface transition-colors hover:border-tertiary hover:text-tertiary"
              >
                <span className="label-caps">Consultar Normas</span>
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-up flex justify-center">
            {cartel ? (
              <div className="relative w-full max-w-md border-2 border-primary-container p-2">
                <div className="absolute left-0 right-0 top-0 h-1 bg-tertiary" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cartel}
                  alt="Cartel oficial del Trofeo de Santiago"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="flex h-80 w-full max-w-md items-center justify-center border-2 border-dashed border-outline-variant text-on-surface-variant">
                Cartel no disponible
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Calendario de actividades */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-12">
        <div className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary">calendar_month</span>
          <h2 className="font-display text-3xl font-bold text-on-surface">Calendario de Actividades</h2>
        </div>

        {activities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((act) => {
              const { dia, mes } = formatFecha(act.date);
              return (
                <article
                  key={act.id}
                  className="group relative border border-outline-variant bg-surface-container p-5 transition-colors hover:border-tertiary"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary-container transition-colors group-hover:bg-tertiary" />
                  <div className="flex items-start gap-4">
                    <div className="flex min-w-[56px] flex-col items-center border border-outline-variant bg-surface-high px-2 py-1">
                      <span className="font-display text-2xl font-bold text-tertiary">{dia}</span>
                      <span className="label-caps text-on-surface-variant">{mes}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-on-surface">{act.name}</h3>
                      <p className="data-mono mt-1 flex items-center gap-1 text-sm text-secondary">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {act.time}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {act.location}
                      </p>
                    </div>
                  </div>
                  {act.description && (
                    <p className="mt-4 border-t border-outline-variant pt-3 text-sm text-on-surface-variant">
                      {act.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
            Aún no hay actividades programadas.
          </p>
        )}
      </section>

      {/* Santiago Apóstol · Patrón */}
      <section className="mx-auto max-w-[1280px] px-6 pb-16 md:px-12">
        <div className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary">history_edu</span>
          <h2 className="font-display text-3xl font-bold text-on-surface">
            Santiago Apóstol · Patrón de España y de la Caballería
          </h2>
        </div>
        <div className="relative border-2 border-primary-container p-2">
          <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-tertiary" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/santiago-patron.jpg"
            alt="Lámina histórica de Santiago Apóstol, patrón de España y de la Caballería"
            className="w-full"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
