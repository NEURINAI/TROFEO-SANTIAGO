export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const rutas = [
    "",
    "/clasificacion",
    "/cross",
    "/voley",
    "/crossfit",
    "/paellas",
    "/playstation",
    "/normas",
  ];
  return rutas.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
