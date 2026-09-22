import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: "https://stahleckerfotografie.nl/sitemap.xml",
    host: "https://stahleckerfotografie.nl",
  };
}
