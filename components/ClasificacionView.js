"use client";

import { useMemo, useRef, useState } from "react";

const PODIO = [
  { pos: 1, medal: "emoji_events", color: "tertiary", height: "h-44", label: "1.º" },
  { pos: 2, medal: "military_tech", color: "secondary", height: "h-32", label: "2.º" },
  { pos: 3, medal: "military_tech", color: "primary", height: "h-24", label: "3.º" },
];

function PodiumBlock({ team, config }) {
  const borderColor = {
    tertiary: "border-tertiary",
    secondary: "border-secondary",
    primary: "border-primary",
  }[config.color];
  const textColor = {
    tertiary: "text-tertiary",
    secondary: "text-secondary",
    primary: "text-primary",
  }[config.color];
  const bgColor = {
    tertiary: "bg-tertiary",
    secondary: "bg-secondary",
    primary: "bg-primary-container",
  }[config.color];

  return (
    <div className="flex w-1/3 max-w-[200px] flex-col items-center">
      <div className={`mb-3 flex flex-col items-center ${config.pos === 1 ? "animate-fade-in-up" : ""}`}>
        <span className={`material-symbols-outlined text-4xl ${textColor}`}>{config.medal}</span>
        <p className="mt-1 text-center font-display text-base font-bold text-on-surface">
          {team?.name || "—"}
        </p>
        <p className={`data-mono text-sm ${textColor}`}>{team ? `${team.totalPoints} pts` : ""}</p>
      </div>
      <div
        className={`animate-grow-up flex w-full ${config.height} items-start justify-center border-2 ${borderColor} bg-surface-container pt-3`}
      >
        <span className={`font-display text-3xl font-bold ${textColor}`}>{config.pos}</span>
      </div>
      <div className={`h-1 w-full ${bgColor}`} />
    </div>
  );
}

export default function ClasificacionView({ standings }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "totalPoints", dir: "desc" });
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const top3 = standings.slice(0, 3);
  const podiumData = {
    1: top3[0],
    2: top3[1],
    3: top3[2],
  };

  const rows = useMemo(() => {
    let data = standings.map((t, i) => ({ ...t, position: i + 1 }));
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          String(t.observations ?? "").toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      let cmp;
      if (sort.key === "name") cmp = a.name.localeCompare(b.name, "es");
      else if (sort.key === "position") cmp = a.position - b.position;
      else cmp = a.totalPoints - b.totalPoints;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [standings, query, sort]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: key === "name" ? "asc" : "desc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-background">
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12">
        {/* Podio de Honor */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">Podio de Honor</h2>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/export/clasificacion?format=xlsx"
              className="inline-flex items-center gap-1 border border-outline-variant px-3 py-2 text-on-surface-variant transition-colors hover:border-tertiary hover:text-tertiary"
              title="Exportar a Excel"
            >
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              <span className="label-caps hidden sm:inline">Excel</span>
            </a>
            <a
              href="/api/export/clasificacion?format=pdf"
              className="inline-flex items-center gap-1 border border-outline-variant px-3 py-2 text-on-surface-variant transition-colors hover:border-tertiary hover:text-tertiary"
              title="Exportar a PDF"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span className="label-caps hidden sm:inline">PDF</span>
            </a>
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1 border border-outline-variant px-3 py-2 text-on-surface-variant transition-colors hover:border-tertiary hover:text-tertiary"
              title="Modo pantalla completa"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
              <span className="label-caps hidden sm:inline">Proyectar</span>
            </button>
          </div>
        </div>

        {standings.length === 0 ? (
          <p className="border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
            Aún no hay equipos clasificados.
          </p>
        ) : (
          <>
            <div className="mb-12 flex items-end justify-center gap-3 md:gap-6">
              <PodiumBlock team={podiumData[2]} config={PODIO[1]} />
              <PodiumBlock team={podiumData[1]} config={PODIO[0]} />
              <PodiumBlock team={podiumData[3]} config={PODIO[2]} />
            </div>

            {/* Buscador */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-xl font-bold text-on-surface">Tabla Completa</h3>
              <div className="flex items-center gap-2 border border-outline-variant bg-surface-container px-3 py-2 sm:w-72">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar equipo..."
                  className="w-full bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto border border-outline-variant">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-high">
                    <th
                      onClick={() => toggleSort("position")}
                      className="label-caps cursor-pointer select-none px-4 py-3 text-left text-on-surface-variant hover:text-tertiary"
                    >
                      Pos
                    </th>
                    <th
                      onClick={() => toggleSort("name")}
                      className="label-caps cursor-pointer select-none px-4 py-3 text-left text-on-surface-variant hover:text-tertiary"
                    >
                      Equipo
                    </th>
                    <th
                      onClick={() => toggleSort("totalPoints")}
                      className="label-caps cursor-pointer select-none px-4 py-3 text-right text-on-surface-variant hover:text-tertiary"
                    >
                      Puntos
                    </th>
                    <th className="label-caps px-4 py-3 text-left text-on-surface-variant">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr
                      key={t.id}
                      className={`border-t border-outline-variant transition-colors hover:bg-surface-high/50 ${
                        t.position === 1 ? "border-l-4 border-l-tertiary" : ""
                      }`}
                    >
                      <td className="data-mono px-4 py-3 text-tertiary">
                        {String(t.position).padStart(2, "0")}
                      </td>
                      <td className={`px-4 py-3 ${t.position === 1 ? "font-semibold text-tertiary" : "text-on-surface"}`}>
                        {t.name}
                      </td>
                      <td className="data-mono px-4 py-3 text-right font-bold text-on-surface">
                        {t.totalPoints}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{t.observations || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
