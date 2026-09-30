import type { Metadata, Viewport } from "next";
import { Amatic_SC, Caveat, Permanent_Marker, Quicksand } from "next/font/google";
import "./globals.css";

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const amatic = Amatic_SC({
  variable: "--font-amatic",
  weight: "700",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const urlSitio = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio),
  title: "Rifa por Aika",
  description:
    "Aika necesita atención veterinaria urgente. Compra tu número por $20.000 y gana hasta $500.000 con la Lotería del Sinuano.",
  openGraph: {
    title: "Rifa por Aika 🐶💗",
    description:
      "Números del 00 al 99 · $20.000 · Sorteo con la Lotería del Sinuano, 20 de octubre.",
    images: ["/img/aika-hero.jpg"],
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7ebe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${marker.variable} ${amatic.variable} ${caveat.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
