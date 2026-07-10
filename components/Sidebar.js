"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/clasificacion", label: "Clasificación General", icon: "emoji_events" },
  { href: "/cross", label: "Cross", icon: "directions_run" },
  { href: "/voley", label: "Vóley", icon: "sports_volleyball" },
  { href: "/crossfit", label: "CrossFit", icon: "fitness_center" },
  { href: "/paellas", label: "Concurso de Paellas", icon: "skillet" },
  { href: "/playstation", label: "EA SPORTS FC", icon: "stadia_controller" },
  { href: "/normas", label: "Normas", icon: "description" },
];

function NavList({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 px-3 py-2.5 transition-colors ${
              active
                ? "bg-primary text-on-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-high"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                active ? "text-on-primary" : "text-on-surface-variant group-hover:text-tertiary"
              }`}
            >
              {item.icon}
            </span>
            <span className="text-sm uppercase tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="border-b-2 border-primary-container px-5 py-5">
      <p className="label-caps text-tertiary">Trofeo de</p>
      <p className="font-display text-2xl font-bold leading-none text-on-surface">
        SANTIAGO
      </p>
      <p className="mt-1 text-xs text-on-surface-variant">Patrón de Caballería y de España</p>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // No mostrar el sidebar público dentro del panel de administración
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Escritorio */}
      <aside className="bg-tactical-noise hidden w-64 shrink-0 flex-col border-r-2 border-primary-container bg-surface-container lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Brand />
        <div className="no-scrollbar flex-1 overflow-y-auto py-4">
          <NavList pathname={pathname} />
        </div>
        <div className="border-t border-outline-variant p-3">
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 border border-tertiary px-3 py-2.5 text-tertiary transition-colors hover:bg-tertiary hover:text-on-tertiary"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            <span className="label-caps">Administrador</span>
          </Link>
        </div>
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-primary-container bg-surface-container px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-on-surface">SANTIAGO</span>
          <span className="label-caps text-tertiary">Trofeo</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center border border-outline text-on-surface"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Cajón móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <aside className="bg-tactical-noise absolute left-0 top-0 flex h-full w-72 flex-col border-r-2 border-primary-container bg-surface-container">
            <div className="flex items-center justify-between border-b-2 border-primary-container px-5 py-4">
              <span className="font-display text-xl font-bold text-on-surface">SANTIAGO</span>
              <button
                onClick={close}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center border border-outline text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto py-4">
              <NavList pathname={pathname} onNavigate={close} />
            </div>
            <div className="border-t border-outline-variant p-3">
              <Link
                href="/admin"
                onClick={close}
                className="flex items-center justify-center gap-2 border border-tertiary px-3 py-2.5 text-tertiary"
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                <span className="label-caps">Administrador</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
