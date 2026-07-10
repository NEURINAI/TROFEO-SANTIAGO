import "./globals.css";
import { Source_Serif_4, Work_Sans, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Trofeo de Santiago | Patrón de Caballería y de España",
    template: "%s | Trofeo de Santiago",
  },
  description:
    "Portal oficial del Trofeo de Santiago, evento deportivo militar en honor al Patrón de Caballería y de España. Clasificaciones, competiciones, calendario y normas.",
  applicationName: "Trofeo de Santiago",
  keywords: ["Trofeo de Santiago", "Caballería", "evento deportivo militar", "clasificación", "competiciones"],
  authors: [{ name: "Trofeo de Santiago" }],
  openGraph: {
    title: "Trofeo de Santiago | Patrón de Caballería y de España",
    description: "Portal oficial del evento deportivo militar Trofeo de Santiago.",
    type: "website",
    locale: "es_ES",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#131313",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`dark ${sourceSerif.variable} ${workSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background">
        <div className="lg:flex">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
