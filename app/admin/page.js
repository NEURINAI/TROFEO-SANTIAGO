import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminPageTitle from "@/components/AdminPageTitle";

export const dynamic = "force-dynamic";

const ACCESOS = [
  { href: "/admin/equipos", label: "Equipos", icon: "groups" },
  { href: "/admin/calendario", label: "Calendario", icon: "calendar_month" },
  { href: "/admin/clasificacion", label: "Clasificación", icon: "emoji_events" },
  { href: "/admin/cross", label: "Cross", icon: "directions_run" },
  { href: "/admin/voley", label: "Vóley", icon: "sports_volleyball" },
  { href: "/admin/crossfit", label: "CrossFit", icon: "fitness_center" },
  { href: "/admin/paellas", label: "Paellas", icon: "skillet" },
  { href: "/admin/playstation", label: "EA SPORTS FC", icon: "stadia_controller" },
  { href: "/admin/medios", label: "Cartel y Medios", icon: "perm_media" },
];

export default async function AdminDashboard() {
  const [teams, activities, psPlayers, psMatches] = await Promise.all([
    prisma.team.count(),
    prisma.activity.count(),
    prisma.psPlayer.count(),
    prisma.psMatch.count(),
  ]);

  const stats = [
    { label: "Equipos", value: teams, icon: "groups" },
    { label: "Actividades", value: activities, icon: "event" },
    { label: "Participantes PS", value: psPlayers, icon: "stadia_controller" },
    { label: "Partidos PS", value: psMatches, icon: "sports_esports" },
  ];

  return (
    <div>
      <AdminPageTitle
        icon="dashboard"
        title="Panel de Mando"
        description="Gestiona toda la información del Trofeo de Santiago desde aquí."
      />

      {/* Estadísticas */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="relative border border-outline-variant bg-surface-container p-5">
            <div className="absolute left-0 top-0 h-full w-1 bg-tertiary" />
            <span className="material-symbols-outlined text-tertiary">{s.icon}</span>
            <div className="mt-2 font-display text-4xl font-bold text-on-surface">{s.value}</div>
            <div className="label-caps mt-1 text-on-surface-variant">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <h2 className="label-caps mb-4 text-on-surface-variant">Gestión</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ACCESOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex flex-col items-center gap-3 border border-outline-variant bg-surface-container p-6 text-center transition-colors hover:border-tertiary"
          >
            <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-tertiary">
              {a.icon}
            </span>
            <span className="label-caps text-on-surface">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
