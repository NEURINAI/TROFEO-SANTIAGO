"use client";

import { useMemo, useState } from "react";

/*
  Tabla de resultados reutilizable con buscador y ordenación por columnas.
  props:
    columns: [{ key, label, mono?, align?, sortable?, render?(row) }]
    rows: array de objetos
    searchKeys: claves sobre las que buscar (por defecto todas de tipo texto)
    initialSort: { key, dir }
    rankColumn: si true, añade columna de posición 01, 02, ... según el orden actual
*/
export default function ResultsTable({
  columns,
  rows,
  searchKeys,
  initialSort = null,
  rankColumn = false,
  searchPlaceholder = "Buscar...",
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(initialSort);

  const keys = searchKeys || columns.map((c) => c.key);

  const filtered = useMemo(() => {
    let data = [...rows];
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter((row) =>
        keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (sort) {
      data.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        let cmp;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "es", { numeric: true });
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, query, sort, keys]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border border-outline-variant bg-surface-container px-3 py-2">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Limpiar" className="text-on-surface-variant hover:text-tertiary">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-outline-variant">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-high">
              {rankColumn && (
                <th className="label-caps px-4 py-3 text-left text-on-surface-variant">Pos</th>
              )}
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    onClick={sortable ? () => toggleSort(col.key) : undefined}
                    className={`label-caps px-4 py-3 text-on-surface-variant ${
                      col.align === "right" ? "text-right" : "text-left"
                    } ${sortable ? "cursor-pointer select-none hover:text-tertiary" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSorted && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          {sort.dir === "asc" ? "arrow_upward" : "arrow_downward"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rankColumn ? 1 : 0)}
                  className="px-4 py-8 text-center text-on-surface-variant"
                >
                  No hay resultados.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-t border-outline-variant transition-colors hover:bg-surface-high/50"
                >
                  {rankColumn && (
                    <td className="data-mono px-4 py-3 text-tertiary">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.align === "right" ? "text-right" : "text-left"} ${
                        col.mono ? "data-mono text-on-surface" : "text-on-surface"
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
