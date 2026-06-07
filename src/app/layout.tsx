import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protocolo Atlas",
  description: "Guias, audios y claridad para el hombre que decide construir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
