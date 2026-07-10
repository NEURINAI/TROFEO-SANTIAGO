"use client";

// Botón de envío que pide confirmación antes de ejecutar la Server Action del formulario.
export default function ConfirmButton({
  children,
  message = "¿Seguro que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  className = "",
  icon = "delete",
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={
        className ||
        "inline-flex items-center gap-1 border border-error-container bg-error-container/20 px-3 py-1.5 text-error transition-colors hover:bg-error-container hover:text-on-error-container"
      }
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      <span className="label-caps">{children || "Eliminar"}</span>
    </button>
  );
}
