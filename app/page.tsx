import StahleckerSite from "@/components/StahleckerSite";

const siteUrl = "https://stahleckerfotografie.nl";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Stahlecker Fotografie",
      inLanguage: "nl-NL",
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#business`,
      name: "Stahlecker Fotografie",
      url: siteUrl,
      image: `${siteUrl}/stahlecker/hero-jeroen.jpg`,
      logo: `${siteUrl}/stahlecker/logo.png`,
      description:
        "Persoonlijke portretfotografie, belangrijke momenten en fotografieworkshops in Zoetermeer en omgeving.",
      email: "stahlecker.fotografie@outlook.com",
      founder: {
        "@type": "Person",
        name: "Jeroen Stahlecker",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Zoetermeer en omgeving",
      },
      sameAs: [
        "https://www.facebook.com/profile.php?id=61590238634912",
        "https://www.linkedin.com/in/jeroen-stahlecker-369604136/",
      ],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Portretfotografie",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Fotografie van belangrijke momenten",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Fotografieworkshops en fotografielessen",
          },
        },
      ],
    },
  ],
};

export default function StahleckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StahleckerSite />
    </>
  );
}
