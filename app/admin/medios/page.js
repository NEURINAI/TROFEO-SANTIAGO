import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload";
import AdminPageTitle from "@/components/AdminPageTitle";
import * as s from "@/lib/adminStyles";

export const dynamic = "force-dynamic";

// Definición de los medios gestionables.
const CARTEL = { key: "cartel", label: "Cartel Oficial (portada)", type: "image" };
const CABECERAS = [
  { key: "header-clasificacion", label: "Cabecera Clasificación" },
  { key: "header-cross", label: "Cabecera Cross" },
  { key: "header-voley", label: "Cabecera Vóley" },
  { key: "header-crossfit", label: "Cabecera CrossFit" },
  { key: "header-paellas", label: "Cabecera Paellas" },
  { key: "header-playstation", label: "Cabecera EA SPORTS FC" },
  { key: "header-normas", label: "Cabecera Normas" },
];
const NORMAS = [
  { key: "norma-generales", label: "Normas Generales" },
  { key: "norma-cross", label: "Normas Cross" },
  { key: "norma-voley", label: "Normas Vóley" },
  { key: "norma-crossfit", label: "Normas CrossFit" },
  { key: "norma-paellas", label: "Normas Paellas" },
  { key: "norma-playstation", label: "Normas EA SPORTS FC" },
];

async function uploadMedia(formData) {
  "use server";
  const key = formData.get("key");
  const label = formData.get("label");
  const type = formData.get("type"); // image | pdf
  const file = formData.get("file");
  if (!key || !file || file.size === 0) return;

  const subdir = type === "pdf" ? "uploads" : "images";
  const path = await saveUpload(file, subdir, key);
  if (!path) return;

  await prisma.mediaAsset.upsert({
    where: { key },
    update: { path, type, label },
    create: { key, path, type, label },
  });

  // Refrescar todo lo que pueda usar este medio.
  revalidatePath("/admin/medios");
  revalidatePath("/");
  revalidatePath("/normas");
  revalidatePath("/clasificacion");
  revalidatePath("/cross");
  revalidatePath("/voley");
  revalidatePath("/crossfit");
  revalidatePath("/paellas");
  revalidatePath("/playstation");
  revalidatePath("/galeria");
}

function MediaRow({ asset, def, type }) {
  const path = asset?.path;
  return (
    <div className={`${s.panelPad} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-on-surface">{def.label}</span>
        {path && (
          <a href={path} target="_blank" rel="noopener noreferrer" className="label-caps text-tertiary hover:underline">
            Ver actual
          </a>
        )}
      </div>
      {type === "image" && path && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={path} alt={def.label} className="max-h-40 w-auto border border-outline-variant object-contain" />
      )}
      <form action={uploadMedia} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="hidden" name="key" value={def.key} />
        <input type="hidden" name="label" value={def.label} />
        <input type="hidden" name="type" value={type} />
        <input
          type="file"
          name="file"
          required
          accept={type === "pdf" ? "application/pdf" : "image/*"}
          className="flex-1 text-sm text-on-surface file:mr-3 file:border file:border-outline file:bg-surface-high file:px-3 file:py-1.5 file:text-on-surface"
        />
        <button type="submit" className={s.btnPrimary}>
          <span className="material-symbols-outlined text-[18px]">upload</span>
          <span className="label-caps">Subir</span>
        </button>
      </form>
    </div>
  );
}

export default async function AdminMedios() {
  const assets = await prisma.mediaAsset.findMany();
  const map = assets.reduce((acc, a) => ((acc[a.key] = a), acc), {});

  return (
    <div>
      <AdminPageTitle
        icon="perm_media"
        title="Cartel y Medios"
        description="Cambia el cartel de la portada, las imágenes de cabecera y los PDF de normas sin tocar el código."
      />

      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Cartel de la portada</h2>
        <MediaRow asset={map[CARTEL.key]} def={CARTEL} type="image" />
      </section>

      <section className="mb-12">
        <h2 className="label-caps mb-4 text-tertiary">Imágenes de cabecera</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {CABECERAS.map((def) => (
            <MediaRow key={def.key} asset={map[def.key]} def={def} type="image" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="label-caps mb-4 text-tertiary">Normas (PDF)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {NORMAS.map((def) => (
            <MediaRow key={def.key} asset={map[def.key]} def={def} type="pdf" />
          ))}
        </div>
      </section>
    </div>
  );
}
