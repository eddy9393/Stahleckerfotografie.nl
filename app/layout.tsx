import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://stahleckerfotografie.nl"),
  title: "Stahlecker Fotografie — Portretten & Fotografieworkshops",
  description:
    "Oprechte fotografie met aandacht voor mens en moment. Portretten, reportages en fotografieworkshops door Stahlecker Fotografie.",
  alternates: { canonical: "https://stahleckerfotografie.nl" },
  // De bestaande preview-instelling is behouden: nog niet laten indexeren.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
