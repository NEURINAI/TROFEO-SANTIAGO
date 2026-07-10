export default function manifest() {
  return {
    name: "Trofeo de Santiago",
    short_name: "Trofeo Santiago",
    description:
      "Portal oficial del Trofeo de Santiago, evento deportivo militar en honor al Patrón de Caballería y de España.",
    start_url: "/",
    display: "standalone",
    background_color: "#131313",
    theme_color: "#131313",
    lang: "es",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
