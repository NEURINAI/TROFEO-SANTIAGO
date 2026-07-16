/*
  Cuadro eliminatorio (bracket) reutilizable — presentacional.
  props.matches: array de objetos
    { id, round, slot, sideA:{name, score}, sideB:{name, score},
      status: 'Pendiente'|'EnJuego'|'Finalizado', winnerName, schedule, field }
*/

const STATUS = {
  Pendiente: { label: "Pendiente", cls: "border-outline text-on-surface-variant" },
  EnJuego: { label: "En Juego", cls: "border-error-container bg-error-container/20 text-error animate-pulse-live" },
  Finalizado: { label: "Finalizado", cls: "border-primary-container text-primary" },
};

function roundName(round, maxRound) {
  // Con una sola ronda se muestra el número (no tiene sentido llamarla "Final").
  if (maxRound <= 1) return `Ronda ${round}`;
  const fromEnd = maxRound - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinales";
  if (fromEnd === 2) return "Cuartos";
  return `Ronda ${round}`;
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

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-6 pb-2">
        {rounds.map((round) => {
          const roundMatches = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.slot - b.slot);
          return (
            <div key={round} className="flex w-72 flex-col">
              <div className="mb-3 border-b-2 border-tertiary pb-1">
                <p className="label-caps text-tertiary">{roundName(round, maxRound)}</p>
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
