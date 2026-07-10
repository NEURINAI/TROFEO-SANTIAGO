import PageHeader from "@/components/PageHeader";
import ClasificacionView from "@/components/ClasificacionView";
import { getGeneralStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clasificación General",
  description: "Clasificación general del Trofeo de Santiago con el podio de honor y la tabla completa de equipos.",
};

export default async function ClasificacionGeneral() {
  const standings = await getGeneralStandings();

  return (
    <div>
      <PageHeader
        mediaKey="header-clasificacion"
        eyebrow="Resultados Globales"
        title="Clasificación General"
        subtitle="Puntuación total acumulada por cada equipo en todas las competiciones del Trofeo."
      />
      <ClasificacionView standings={standings} />
    </div>
  );
}
