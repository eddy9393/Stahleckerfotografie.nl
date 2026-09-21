export type Language = "nl" | "en";

export const DEFAULT_SITE_CONTENT_NL = {
  hero_eyebrow: "Stahlecker Fotografie",
  hero_headline: "Oprechte fotografie met aandacht voor mens en moment.",
  hero_cta: "Ontdek mijn werk",

  portfolio_eyebrow: "Portfolio",
  portfolio_heading: "Portretten",

  workshop_eyebrow: "Leren zien",
  workshop_heading: "Fotografieworkshop",
  workshop_lead:
    "Voor beginnende fotografen en mensen die hun camera beter willen leren begrijpen. De workshop kan individueel of in een kleine groep worden gegeven.",
  workshop_body_1:
    "Tijdens de workshop leer je de belangrijkste instellingen van je camera begrijpen en gebruiken, zoals sluitertijd, diafragma en ISO. Daarnaast besteden we aandacht aan compositie, licht en bewust leren kijken. Er is veel ruimte om praktisch te oefenen en vragen te stellen.",
  workshop_body_2:
    "De workshop duurt 1 à 2 uur en vindt plaats in Zoetermeer en omgeving. De precieze locatie kan afhankelijk zijn van het onderwerp en de wensen van de deelnemer. Neem je eigen camera mee, bij voorkeur een camera waarbij sluitertijd, diafragma en ISO handmatig kunnen worden ingesteld. Eigen objectieven en andere fotografieaccessoires kunnen natuurlijk ook mee.",
  workshop_body_3:
    "De workshop wordt rustig en stap voor stap opgebouwd. De nadruk ligt op zelf fotograferen en begrijpen waarom bepaalde instellingen of keuzes werken. De inhoud kan worden aangepast aan jouw niveau en leerwensen. De prijs is op aanvraag.",

  about_eyebrow: "Over mij",
  about_heading: "Jeroen Stahlecker",
  about_p1:
    "Mijn naam is Jeroen Stahlecker en fotografie is voor mij een manier om mensen, momenten en verhalen op een persoonlijke manier vast te leggen.",
  about_p2:
    "Wat mij vooral aanspreekt, zijn echte momenten. Een blik, een ontmoeting, een bijzonder moment of juist iets kleins dat gemakkelijk voorbijgaat. Ik probeer niet alleen te fotograferen wat er gebeurt, maar ook iets van de sfeer en de persoon achter het beeld te laten zien.",
  about_p3:
    "Mijn stijl is rustig, authentiek en persoonlijk. Tijdens het fotograferen vind ik het belangrijk dat mensen zich op hun gemak kunnen voelen. Ik neem de tijd, geef duidelijke aanwijzingen wanneer dat nodig is en probeer geen situatie te forceren. Juist wanneer iemand zichzelf kan zijn, ontstaan vaak de mooiste beelden.",
  about_p4:
    "Binnen Stahlecker Fotografie richt ik mij vooral op belangrijke momenten, portretfotografie en fotografieworkshops en lessen. Naast zelf fotograferen vind ik het ook leuk om mijn kennis over fotografie over te brengen. Ik leg dingen graag rustig en stap voor stap uit en vind het mooi wanneer iemand niet alleen leert hoe een camera werkt, maar ook anders leert kijken.",
  about_p5:
    "Met Stahlecker Fotografie bouw ik mijn fotografie stap voor stap verder uit. Daarbij wil ik vooral werk maken dat persoonlijk is en betekenis heeft voor de mensen die ik fotografeer.",

  contact_eyebrow: "Contact",
  contact_heading: "Vraag een offerte aan",
  contact_intro:
    "Wil je een belangrijk moment laten vastleggen, een portret laten maken of een fotografieworkshop volgen? Vul hieronder je voorkeuren in, dan neem ik contact met je op.",

  placeholder_headline: "De website is binnenkort helemaal klaar.",
  placeholder_intro: "Wil je nu al contact opnemen? Neem dan contact op via",

  footer_brand: "Stahlecker Fotografie",
} as const;

export const DEFAULT_SITE_CONTENT_EN = {
  hero_eyebrow: "Stahlecker Photography",
  hero_headline: "Authentic photography with attention to people and meaningful moments.",
  hero_cta: "Discover my work",

  portfolio_eyebrow: "Portfolio",
  portfolio_heading: "Portraits",

  workshop_eyebrow: "Learn to see",
  workshop_heading: "Photography workshop",
  workshop_lead:
    "For beginning photographers and anyone who wants to understand their camera better. The workshop can be given individually or in a small group.",
  workshop_body_1:
    "During the workshop you will learn to understand and use the most important camera settings, including shutter speed, aperture and ISO. We also focus on composition, light and learning to observe consciously. There is plenty of room for hands-on practice and questions.",
  workshop_body_2:
    "The workshop lasts 1 to 2 hours and takes place in Zoetermeer and the surrounding area. The exact location can depend on the subject and the participant's wishes. Bring your own camera, preferably one that allows you to set shutter speed, aperture and ISO manually. You are of course welcome to bring your own lenses and other photography accessories as well.",
  workshop_body_3:
    "The workshop is built up calmly and step by step. The emphasis is on taking photographs yourself and understanding why certain settings or choices work. The content can be adapted to your level and learning goals. Price on request.",

  about_eyebrow: "About me",
  about_heading: "Jeroen Stahlecker",
  about_p1:
    "My name is Jeroen Stahlecker and photography is my way of capturing people, moments and stories in a personal way.",
  about_p2:
    "What appeals to me most are genuine moments: a look, an encounter, a special occasion or something small that could easily pass unnoticed. I try not only to photograph what is happening, but also to show something of the atmosphere and the person behind the image.",
  about_p3:
    "My style is calm, authentic and personal. When I photograph people, I find it important that they feel at ease. I take my time, give clear guidance when needed and try not to force a situation. The most beautiful images often emerge when someone can simply be themselves.",
  about_p4:
    "Within Stahlecker Photography I mainly focus on important moments, portrait photography, and photography workshops and lessons. Besides taking photographs myself, I also enjoy sharing my knowledge of photography. I like to explain things calmly and step by step, and I enjoy seeing someone learn not only how a camera works, but also how to look at the world differently.",
  about_p5:
    "With Stahlecker Photography I am continuing to develop my work step by step. Above all, I want to create photographs that feel personal and meaningful to the people I photograph.",

  contact_eyebrow: "Contact",
  contact_heading: "Request a quote",
  contact_intro:
    "Would you like an important moment captured, a portrait made or to take a photography workshop? Fill in your preferences below and I will get in touch with you.",

  placeholder_headline: "The website will be fully ready soon.",
  placeholder_intro: "Would you like to get in touch already? Contact me via",

  footer_brand: "Stahlecker Photography",
} as const;

export const DEFAULT_SITE_CONTENT = DEFAULT_SITE_CONTENT_NL;

export type SiteContentKey = keyof typeof DEFAULT_SITE_CONTENT_NL;
export type SiteContent = Record<SiteContentKey, string>;

export type TextSectionId =
  | "hero"
  | "portfolio"
  | "workshop"
  | "about"
  | "contact"
  | "placeholder"
  | "footer";

export type TextFieldConfig = {
  key: SiteContentKey;
  label: Record<Language, string>;
  rows?: number;
};

export type TextSectionConfig = {
  title: Record<Language, string>;
  fields: TextFieldConfig[];
};

export function getDbContentKey(key: SiteContentKey, language: Language) {
  return language === "nl" ? key : `${key}_en`;
}

export const TEXT_SECTIONS: Record<TextSectionId, TextSectionConfig> = {
  hero: {
    title: { nl: "Hero", en: "Hero" },
    fields: [
      { key: "hero_eyebrow", label: { nl: "Bovenregel", en: "Eyebrow" } },
      { key: "hero_headline", label: { nl: "Hoofdtitel", en: "Main title" }, rows: 3 },
      { key: "hero_cta", label: { nl: "Knoptekst", en: "Button text" } },
    ],
  },
  portfolio: {
    title: { nl: "Portfolio", en: "Portfolio" },
    fields: [
      { key: "portfolio_eyebrow", label: { nl: "Bovenregel", en: "Eyebrow" } },
      { key: "portfolio_heading", label: { nl: "Titel", en: "Title" } },
    ],
  },
  workshop: {
    title: { nl: "Workshops en fotografielessen", en: "Photography workshops and lessons" },
    fields: [
      { key: "workshop_eyebrow", label: { nl: "Bovenregel", en: "Eyebrow" } },
      { key: "workshop_heading", label: { nl: "Titel", en: "Title" } },
      { key: "workshop_lead", label: { nl: "Introductie", en: "Introduction" }, rows: 4 },
      { key: "workshop_body_1", label: { nl: "Tekst 1", en: "Text 1" }, rows: 5 },
      { key: "workshop_body_2", label: { nl: "Tekst 2", en: "Text 2" }, rows: 5 },
      { key: "workshop_body_3", label: { nl: "Tekst 3", en: "Text 3" }, rows: 5 },
    ],
  },
  about: {
    title: { nl: "Over mij", en: "About me" },
    fields: [
      { key: "about_eyebrow", label: { nl: "Bovenregel", en: "Eyebrow" } },
      { key: "about_heading", label: { nl: "Naam / titel", en: "Name / title" } },
      { key: "about_p1", label: { nl: "Alinea 1", en: "Paragraph 1" }, rows: 4 },
      { key: "about_p2", label: { nl: "Alinea 2", en: "Paragraph 2" }, rows: 5 },
      { key: "about_p3", label: { nl: "Alinea 3", en: "Paragraph 3" }, rows: 5 },
      { key: "about_p4", label: { nl: "Alinea 4", en: "Paragraph 4" }, rows: 6 },
      { key: "about_p5", label: { nl: "Alinea 5", en: "Paragraph 5" }, rows: 4 },
    ],
  },
  contact: {
    title: { nl: "Contact", en: "Contact" },
    fields: [
      { key: "contact_eyebrow", label: { nl: "Bovenregel", en: "Eyebrow" } },
      { key: "contact_heading", label: { nl: "Titel", en: "Title" } },
      { key: "contact_intro", label: { nl: "Introductie", en: "Introduction" }, rows: 4 },
    ],
  },
  placeholder: {
    title: { nl: "Placeholder", en: "Placeholder" },
    fields: [
      { key: "placeholder_headline", label: { nl: "Titel", en: "Title" }, rows: 2 },
      { key: "placeholder_intro", label: { nl: "Introductie", en: "Introduction" }, rows: 3 },
    ],
  },
  footer: {
    title: { nl: "Footer", en: "Footer" },
    fields: [{ key: "footer_brand", label: { nl: "Naam", en: "Name" } }],
  },
};
