export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-2 border-primary-container bg-surface-lowest">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-lg font-bold text-on-surface">TROFEO DE SANTIAGO</p>
          <p className="text-xs text-on-surface-variant">Evento deportivo militar · Patrón de Caballería y de España</p>
        </div>
        <p className="label-caps text-on-surface-variant">© {year} · Aplicación Oficial TF-A</p>
      </div>
    </footer>
  );
}
