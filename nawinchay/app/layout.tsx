import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ñawinchay",
  description:
    "Atisunchik ya midio las capacidades. Nadie las habia leido. UGEL Huaytara, Huancavelica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-brand-surface font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
