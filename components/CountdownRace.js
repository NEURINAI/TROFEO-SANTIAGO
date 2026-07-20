"use client";

import { useEffect, useState } from "react";

// Segundos transcurridos desde medianoche en UTC (fiable en todos los navegadores).
function utcSecondsNow() {
  const now = new Date();
  return now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
}

// Cuenta atrás hasta la hora objetivo en UTC.
// Líbano está actualmente en UTC+2, por lo que 19:00 de Líbano = 17:00 UTC.
// (No se usa la zona "Asia/Beirut" porque su base de datos calcula UTC+3, que no
//  coincide con la hora real de Líbano.)
export default function CountdownRace({ targetUtcHour = 17, finished = false }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (finished) return;
    const tick = () => setRemaining(targetUtcHour * 3600 - utcSecondsNow());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetUtcHour, finished]);

  // Prueba terminada: bandera de meta.
  if (finished) {
    return (
      <div className="inline-flex items-center gap-3 border-2 border-tertiary bg-tertiary/10 px-4 py-2">
        <span className="material-symbols-outlined text-tertiary">sports_score</span>
        <div className="leading-tight">
          <div className="label-caps text-on-surface-variant">Cross · 5K</div>
          <div className="data-mono text-2xl font-bold text-tertiary">META · FINALIZADA</div>
        </div>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const started = remaining !== null && remaining <= 0;
  let display = "--:--:--";
  if (remaining !== null && remaining > 0) {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const sec = remaining % 60;
    display = `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }

  return (
    <div className="inline-flex items-center gap-3 border-2 border-[#93000a] bg-[#93000a]/15 px-4 py-2">
      <span className="material-symbols-outlined animate-pulse-live text-[#ff4d4d]">timer</span>
      <div className="leading-tight">
        <div className="label-caps text-[#ff8a8a]">Salida · 19:00 (Líbano)</div>
        {started ? (
          <div className="data-mono text-xl font-bold text-[#ff4d4d]">¡EN MARCHA!</div>
        ) : (
          <div className="data-mono text-2xl font-bold tabular-nums text-[#ff4d4d]">{display}</div>
        )}
      </div>
    </div>
  );
}
