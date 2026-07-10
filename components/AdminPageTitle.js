// Título de sección del panel de administración.
export default function AdminPageTitle({ icon, title, description }) {
  return (
    <div className="mb-8 border-b-2 border-primary-container pb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="material-symbols-outlined text-3xl text-tertiary">{icon}</span>}
        <h1 className="font-display text-3xl font-bold text-on-surface">{title}</h1>
      </div>
      {description && <p className="mt-2 text-on-surface-variant">{description}</p>}
    </div>
  );
}
