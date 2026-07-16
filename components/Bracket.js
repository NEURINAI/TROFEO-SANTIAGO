import { BRACKET_PHASES } from "@/lib/phases";

/*
  Cuadro eliminatorio (bracket) reutilizable — presentacional.
  Los enfrentamientos se agrupan en columnas por su FASE (roundLabel):
  Fase de Grupo 1/2, Cuartos, Semifinales, Final. Si un partido no tiene
  fase, se agrupa por "Ronda N".
  props.matches: { id, round, roundLabel, slot, sideA, sideB, status, winnerName, schedule, field }
*/

const STATUS = {
  Pendiente: { label: "Pendiente", cls: "border-outline text-on-surface-variant" },
  EnJuego: { label: "En Juego", cls: "border-error-container bg-error-container/20 text-error animate-pulse-live" },
  Finalizado: { label: "Finalizado", cls: "border-primary-container text-primary" },
};

// Clave de fase de un partido: su etiqueta escrita, o "Ronda N" si no tiene.
function phaseKey(m) {
  return m.roundLabel && m.roundLabel.trim() ? m.roundLabel.trim() : `Ronda ${m.round}`;
}

function Side({ side, isWinner, status }) {
  const hasScore = side?.score !== null && side?.score !== undefined;
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 ${
        isWinner ? "text-tertiary" : status === "Finalizado" ? "opacity-70" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary-container text-xs font-bold text-on-primary-container">
          {(side?.name || "?").charAt(0).toUpperCase()}
        </span>
        <span className="truncate text-sm text-on-surface">{side?.name || "Por definir"}</span>
      </div>
      <span className="data-mono ml-2 shrink-0 text-lg font-bold text-on-surface">
        {hasScore ? side.score : "-"}
      </span>
    </div>
  );
}

export default function Bracket({ matches, emptyLabel = "No hay enfrentamientos registrados." }) {
  if (!matches || matches.length === 0) {
    return (
      <p className="border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
        {emptyLabel}
      </p>
    );
  }

  // Orden de una fase: primero las predefinidas (Grupo 1/2, Cuartos, Semis, Final),
  // luego el resto por número de ronda.
  const phaseOrder = (label) => {
    const idx = BRACKET_PHASES.indexOf(label);
    if (idx >= 0) return idx;
    const rounds = matches.filter((m) => phaseKey(m) === label).map((m) => m.round);
    return BRACKET_PHASES.length + Math.min(...rounds);
  };

  const phases = [...new Set(matches.map(phaseKey))].sort(
    (a, b) => phaseOrder(a) - phaseOrder(b)
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-6 pb-2">
        {phases.map((phase) => {
          const roundMatches = matches
            .filter((m) => phaseKey(m) === phase)
            .sort((a, b) => a.round - b.round || a.slot - b.slot);
          return (
            <div key={phase} className="flex w-72 flex-col">
              <div className="mb-3 border-b-2 border-tertiary pb-1">
                <p className="label-caps text-tertiary">{phase}</p>
              </div>
              <div className="flex flex-1 flex-col justify-around gap-4">
                {roundMatches.map((m) => {
                  const st = STATUS[m.status] || STATUS.Pendiente;
                  const aWins = m.winnerName && m.sideA?.name === m.winnerName;
                  const bWins = m.winnerName && m.sideB?.name === m.winnerName;
                  return (
                    <div key={m.id} className="border border-outline-variant bg-surface-container">
                      <div className="flex items-center justify-between border-b border-outline-variant px-3 py-1.5">
                        <span className="label-caps text-on-surface-variant">
                          {m.schedule || `Enc. ${String(m.slot + 1).padStart(2, "0")}`}
                        </span>
                        <span className={`label-caps border px-1.5 py-0.5 ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="divide-y divide-outline-variant">
                        <Side side={m.sideA} isWinner={aWins} status={m.status} />
                        <Side side={m.sideB} isWinner={bWins} status={m.status} />
                      </div>
                      {m.field && (
                        <div className="flex items-center gap-1 border-t border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">stadium</span>
                          {m.field}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
