"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SECCIONES = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/equipos", label: "Equipos", icon: "groups" },
  { href: "/admin/calendario", label: "Calendario", icon: "calendar_month" },
  { href: "/admin/clasificacion", label: "Clasificación General", icon: "emoji_events" },
  { href: "/admin/cross", label: "Cross", icon: "directions_run" },
  { href: "/admin/voley", label: "Vóley", icon: "sports_volleyball" },
  { href: "/admin/crossfit", label: "CrossFit", icon: "fitness_center" },
  { href: "/admin/paellas", label: "Paellas", icon: "skillet" },
  { href: "/admin/playstation", label: "EA SPORTS FC", icon: "stadia_controller" },
  { href: "/admin/medios", label: "Cartel y Medios", icon: "perm_media" },
];

function Items({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {SECCIONES.map((s) => {
        const active = s.exact
          ? pathname === s.href
          : pathname === s.href || pathname.startsWith(s.href + "/");
        return (
          <Link
            key={s.href}
            href={s.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 px-3 py-2.5 transition-colors ${
              active
                ? "bg-primary text-on-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-high"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                active ? "text-on-primary" : "group-hover:text-tertiary"
              }`}
            >
              {s.icon}
            </span>
            <span className="text-sm uppercase tracking-wide">{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({ logoutAction }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Barra superior de mando (carmesí) */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-black/30 bg-error-container px-4 text-on-error-container">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="flex h-8 w-8 items-center justify-center lg:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="material-symbols-outlined text-[20px]">shield</span>
          <span className="label-caps font-bold">Panel de Mando · Trofeo de Santiago</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="label-caps hidden items-center gap-1 hover:underline sm:flex">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Ver Web
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="label-caps flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Salir
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar escritorio */}
      <aside className="bg-tactical-noise fixed left-0 top-12 hidden h-[calc(100vh-3rem)] w-64 flex-col border-r-2 border-primary-container bg-surface-container lg:flex">
        <div className="border-b-2 border-primary-container px-5 py-4">
          <p className="label-caps text-tertiary">Administración</p>
          <p className="font-display text-xl font-bold text-on-surface">OPERACIONES</p>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto py-4">
          <Items pathname={pathname} />
        </div>
      </aside>

      {/* Cajón móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <aside className="bg-tactical-noise absolute left-0 top-0 flex h-full w-72 flex-col border-r-2 border-primary-container bg-surface-container">
            <div className="flex items-center justify-between border-b-2 border-primary-container px-5 py-4">
              <span className="font-display text-lg font-bold text-on-surface">OPERACIONES</span>
              <button onClick={close} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center border border-outline text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto py-4">
              <Items pathname={pathname} onNavigate={close} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
