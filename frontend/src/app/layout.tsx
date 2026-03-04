import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Asociación Nikkei de Sinaloa | シナロア日系青年協会",
  description:
    "Plataforma digital de la comunidad Nikkei en Sinaloa, México. Preservando la herencia japonesa y conectando generaciones.",
  keywords: ["Nikkei", "Sinaloa", "japonés", "comunidad", "asociación", "cultura japonesa"],
  authors: [{ name: "Juan Antonio Velázquez Alarcón" }],
  openGraph: {
    title: "Asociación Nikkei de Sinaloa",
    description: "Preservando el legado de nuestros antepasados, conectando generaciones.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${notoSerifJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}