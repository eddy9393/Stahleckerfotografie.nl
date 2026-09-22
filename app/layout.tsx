import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://stahleckerfotografie.nl";
const siteName = "Stahlecker Fotografie";
const title = "Stahlecker Fotografie | Portretfotografie & Fotografieworkshops";
const description =
  "Persoonlijke portretfotografie, belangrijke momenten en fotografieworkshops in Zoetermeer en omgeving. Oprechte fotografie met aandacht voor mens en moment.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  authors: [{ name: "Jeroen Stahlecker", url: siteUrl }],
  creator: "Jeroen Stahlecker",
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/stahlecker/hero-jeroen.jpg",
        width: 1200,
        height: 630,
        alt: "Jeroen Stahlecker van Stahlecker Fotografie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/stahlecker/hero-jeroen.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
