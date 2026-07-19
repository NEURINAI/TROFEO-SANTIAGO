"use client";

import { useEffect, useState } from "react";

// Segundos transcurridos desde medianoche en hora local de Líbano (Asia/Beirut).
// Usa la zona horaria real, así que respeta el cambio de hora (DST).
function beirutSecondsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Beirut",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  return get("hour") * 3600 + get("minute") * 60 + get("second");
}

// Cuenta atrás hasta las HH:00 (por defecto 19:00) hora de Líbano.
export default function CountdownRace({ targetHour = 19 }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const tick = () => setRemaining(targetHour * 3600 - beirutSecondsNow());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHour]);

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
