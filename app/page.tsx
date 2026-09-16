"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useScrollReveal } from "@/lib/useScrollReveal";

const NAV_ITEMS = [
  { label: "Belangrijke momenten", href: "#portretten" },
  { label: "Portretfotografie", href: "#portretten" },
  { label: "Fotografieworkshop", href: "#workshop" },
  { label: "Over mij", href: "#over-mij" },
  { label: "Vraag een offerte aan", href: "#offerte" },
];

const PORTFOLIO_FOTOS = [
  {
    src: "/stahlecker/portfolio-krant.webp",
    alt: "Twee kinderen aan een fruittafel tijdens een buurtactiviteit",
    ratio: "1920 / 1081",
    priority: true,
    caption: "Gepubliceerd in Streekblad Zoetermeer",
    href: "https://www.streekbladzoetermeer.nl/nieuws/actueel/170931/groot-zomerfeest-brengt-kinderen-en-buurt-samen?fbclid=IwY2xjawTyb_VwZG9mAWV4dG4DYWVtAjExAHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5CXMl1O2g0eEAiZ34DrwQzmu7Pul6VhTboESyZVsUgJ7YOWqsOdQcNCZyAzw_aem_b3RxBItpo8bImvxHaAtjpA",
  },
  {
    src: "/stahlecker/portfolio-gemeente.jpg",
    alt: "Burgemeester in gesprek tijdens een gemeentelijke bijeenkomst",
    ratio: "2048 / 1536",
    caption: "Dialoogbijeenkomst MBO Rijnland Zoetermeer",
  },
  {
    src: "/stahlecker/portfolio-maan.jpg",
    alt: "Ringvormige zonsverduistering tegen een zwarte lucht",
    ratio: "1 / 1",
    caption:
      "Bij het fotograferen van deze zonsverduistering waren geduld en voorbereiding erg belangrijk.",
    // Zelfde tegelverhouding als de zwaan-foto hiernaast, zodat ze op
    // desktop precies even breed en hoog worden (zie .portfolioItemMatch).
    matchZwaan: true,
  },
  {
    src: "/stahlecker/portfolio-zwaan.jpg",
    alt: "Glazen bol op een houten paal met een zwaan in de sneeuw op de achtergrond",
    ratio: "2048 / 1974",
  },
];


type FormStatus = "idle" | "loading" | "success" | "error";

export default function StahleckerPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [dienst, setDienst] = useState("");
  const [bericht, setBericht] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [foutmelding, setFoutmelding] = useState("");

  // Vier losse refs (niet in een .map — hooks mogen niet in een lus
  // worden aangeroepen) met een licht oplopende vertraging voor een
  // rustige, getrapte fade-in van de portfoliofoto's tijdens het scrollen.
  const portfolioRef0 = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const portfolioRef1 = useScrollReveal<HTMLDivElement>({ delay: 90 });
  const portfolioRef2 = useScrollReveal<HTMLDivElement>({ delay: 180 });
  const portfolioRef3 = useScrollReveal<HTMLDivElement>({ delay: 270 });
  const portfolioRefs = [portfolioRef0, portfolioRef1, portfolioRef2, portfolioRef3];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFoutmelding("");

    try {
      const res = await fetch("/api/stahlecker-offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email, telefoon, dienst, bericht }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFoutmelding(data.error ?? "Versturen mislukt. Probeer het opnieuw.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setNaam("");
      setEmail("");
      setTelefoon("");
      setDienst("");
      setBericht("");
    } catch {
      setFoutmelding("Versturen mislukt. Controleer je internetverbinding en probeer het opnieuw.");
      setStatus("error");
    }
  }

  return (
    <div className={styles.pagina}>
      {/* ── Header ────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#top" className={styles.logoLink} aria-label="Stahlecker Fotografie — home">
            <Image
              src="/stahlecker/logo.png"
              alt="Stahlecker Fotografie"
              width={841}
              height={417}
              className={styles.logoImg}
              priority
            />
          </a>

          <nav className={styles.nav} aria-label="Hoofdmenu">
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={styles.navLink}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className={styles.menuToggle}
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
              {menuOpen ? (
                <path d="M2 2 L16 16 M16 2 L2 16" />
              ) : (
                <path d="M1 4 H17 M1 9 H17 M1 14 H17" />
              )}
            </svg>
          </button>
        </div>

        <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}>
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ──────────────────────────────────────────────── */}
        {/* Foto vult de hele hero edge-to-edge, op elke schermbreedte.
            Tekst overlapt links, met een subtiel donker verloop (scrim)
            erachter voor leesbaarheid. */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <p className={styles.heroEyebrow}>Stahlecker Fotografie</p>
              <h1 className={styles.heroHeadline}>
                Oprechte fotografie met aandacht voor mens en moment.
              </h1>
              <a href="#portretten" className={styles.scrollCue}>
                <span className={styles.scrollCueLabel}>Ontdek mijn werk</span>
                <span className={styles.scrollCueRing}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M2 5 L7 10 L12 5" />
                  </svg>
                </span>
              </a>
            </div>

            <div className={styles.heroImageWrap}>
              <Image
                src="/stahlecker/hero-jeroen.jpg"
                alt="Portret van fotograaf Jeroen Stahlecker met camera"
                fill
                sizes="100vw"
                className={styles.heroImage}
                priority
              />
              <div className={styles.heroScrim} aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ── Portretten / portfolio ────────────────────────────── */}
        <section id="portretten" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.portfolioHead}>
              <p className={styles.eyebrow}>Portfolio</p>
              <h2 className={styles.sectionHeading}>Portretten</h2>
            </div>

            <div className={styles.portfolioGrid}>
              {PORTFOLIO_FOTOS.map((foto, i) => {
                const tegel = (
                  <>
                    <div
                      ref={portfolioRefs[i]}
                      className={`${styles.portfolioItem} ${foto.matchZwaan ? styles.portfolioItemMatch : ""}`}
                      style={{ aspectRatio: foto.ratio }}
                    >
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        sizes="(min-width: 720px) 50vw, 100vw"
                        className={styles.portfolioImg}
                        priority={foto.priority}
                      />
                    </div>
                    {foto.caption && (
                      <p className={styles.portfolioCaption}>
                        {foto.caption}
                        {foto.href && <span className={styles.portfolioCaptionArrow}>↗</span>}
                      </p>
                    )}
                  </>
                );

                // Alleen de foto's met een externe link (zoals de
                // krantfoto) worden in een <a> gewrapt; de rest blijft
                // een gewone, niet-klikbare tegel.
                return foto.href ? (
                  <a
                    key={foto.src}
                    href={foto.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${foto.caption} — opent artikel in nieuw tabblad`}
                    className={styles.portfolioFigure}
                  >
                    {tegel}
                  </a>
                ) : (
                  <div key={foto.src} className={styles.portfolioFigure}>
                    {tegel}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Fotografieworkshop ────────────────────────────────── */}
        <section id="workshop" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.workshopGrid}>
              <div className={styles.workshopLead}>
                <p className={styles.eyebrow}>Leren zien</p>
                <h2 className={styles.sectionHeading}>Fotografieworkshop</h2>
                <p>
                  Voor beginnende fotografen en mensen die hun camera beter willen leren begrijpen.
                  De workshop kan individueel of in een kleine groep worden gegeven.
                </p>
              </div>

              <div className={styles.workshopBody}>
                <p>
                  Tijdens de workshop leer je de belangrijkste instellingen van je camera begrijpen
                  en gebruiken, zoals sluitertijd, diafragma en ISO. Daarnaast besteden we aandacht
                  aan compositie, licht en bewust leren kijken. Er is veel ruimte om praktisch te
                  oefenen en vragen te stellen.
                </p>
                <p>
                  De workshop duurt 1 à 2 uur en vindt plaats in Zoetermeer en omgeving. De precieze
                  locatie kan afhankelijk zijn van het onderwerp en de wensen van de deelnemer. Neem
                  je eigen camera mee, bij voorkeur een camera waarbij sluitertijd, diafragma en ISO
                  handmatig kunnen worden ingesteld. Eigen objectieven en andere fotografieaccessoires
                  kunnen natuurlijk ook mee.
                </p>
                <p>
                  De workshop wordt rustig en stap voor stap opgebouwd. De nadruk ligt op zelf
                  fotograferen en begrijpen waarom bepaalde instellingen of keuzes werken. De inhoud
                  kan worden aangepast aan jouw niveau en leerwensen. De prijs is op aanvraag.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Over mij ───────────────────────────────────────────── */}
        <section id="over-mij" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.overMijGrid}>
              <div className={styles.overMijImageWrap}>
                <Image
                  src="/stahlecker/over-mij-jeroen.jpg"
                  alt="Jeroen Stahlecker"
                  fill
                  sizes="(min-width: 780px) 380px, 100vw"
                  className={styles.overMijImg}
                />
              </div>

              <div className={styles.overMijTekst}>
                <p className={styles.eyebrow}>Over mij</p>
                <h2 className={styles.sectionHeading} style={{ marginBottom: "1.25rem" }}>
                  Jeroen Stahlecker
                </h2>
                <p>
                  Mijn naam is Jeroen Stahlecker en fotografie is voor mij een manier om mensen,
                  momenten en verhalen op een persoonlijke manier vast te leggen.
                </p>
                <p>
                  Wat mij vooral aanspreekt, zijn echte momenten. Een blik, een ontmoeting, een
                  bijzonder moment of juist iets kleins dat gemakkelijk voorbijgaat. Ik probeer niet
                  alleen te fotograferen wat er gebeurt, maar ook iets van de sfeer en de persoon
                  achter het beeld te laten zien.
                </p>
                <p>
                  Mijn stijl is rustig, authentiek en persoonlijk. Tijdens het fotograferen vind ik
                  het belangrijk dat mensen zich op hun gemak kunnen voelen. Ik neem de tijd, geef
                  duidelijke aanwijzingen wanneer dat nodig is en probeer geen situatie te forceren.
                  Juist wanneer iemand zichzelf kan zijn, ontstaan vaak de mooiste beelden.
                </p>
                <p>
                  Binnen Stahlecker Fotografie richt ik mij vooral op belangrijke momenten,
                  portretfotografie en fotografieworkshops en lessen. Naast zelf fotograferen vind ik
                  het ook leuk om mijn kennis over fotografie over te brengen. Ik leg dingen graag
                  rustig en stap voor stap uit en vind het mooi wanneer iemand niet alleen leert hoe
                  een camera werkt, maar ook anders leert kijken.
                </p>
                <p>
                  Met Stahlecker Fotografie bouw ik mijn fotografie stap voor stap verder uit. Daarbij
                  wil ik vooral werk maken dat persoonlijk is en betekenis heeft voor de mensen die ik
                  fotografeer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Offerte ────────────────────────────────────────────── */}
        <section id="offerte" className={styles.section}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>Contact</p>
            <h2 className={styles.sectionHeading} style={{ marginBottom: "1.25rem" }}>
              Vraag een offerte aan
            </h2>
            <p className={styles.offerteIntro}>
              Wil je een belangrijk moment laten vastleggen, een portret laten maken of een
              fotografieworkshop volgen? Vul hieronder je voorkeuren in, dan neem ik contact met je op.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="naam">Naam</label>
                <input
                  id="naam"
                  name="naam"
                  type="text"
                  required
                  autoComplete="name"
                  className={styles.input}
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefoon">Telefoonnummer (optioneel)</label>
                <input
                  id="telefoon"
                  name="telefoon"
                  type="tel"
                  autoComplete="tel"
                  className={styles.input}
                  value={telefoon}
                  onChange={(e) => setTelefoon(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="dienst">Gewenste dienst</label>
                <select
                  id="dienst"
                  name="dienst"
                  required
                  className={styles.input}
                  value={dienst}
                  onChange={(e) => setDienst(e.target.value)}
                >
                  <option value="">Kies een dienst</option>
                  <option value="Belangrijke momenten">Belangrijke momenten</option>
                  <option value="Portretfotografie">Portretfotografie</option>
                  <option value="Fotografieworkshops en lessen">Fotografieworkshops en lessen</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="bericht">Vertel iets over je aanvraag</label>
                <textarea
                  id="bericht"
                  name="bericht"
                  className={styles.textarea}
                  maxLength={400}
                  placeholder="Bijvoorbeeld: waar vindt de opdracht plaats en welke datum of periode heb je in gedachten?"
                  value={bericht}
                  onChange={(e) => setBericht(e.target.value)}
                />
                <span className={styles.charCount}>{bericht.length}/400</span>
              </div>

              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitBtn} disabled={status === "loading"}>
                  {status === "loading" ? "Versturen…" : "Aanvraag versturen"}
                </button>

                {status === "success" && (
                  <p className={`${styles.statusMsg} ${styles.statusSuccess}`}>
                    Bedankt! Je aanvraag is verstuurd — je krijgt zo snel mogelijk bericht.
                  </p>
                )}
                {status === "error" && (
                  <p className={`${styles.statusMsg} ${styles.statusError}`}>{foutmelding}</p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <p className={styles.footerBrand}>Stahlecker Fotografie</p>
          <div className={styles.footerLinks}>
            <a href="mailto:stahlecker.fotografie@outlook.com" className={styles.footerEmail}>
              stahlecker.fotografie@outlook.com
            </a>
            <div className={styles.footerSocials} aria-label="Social media">
              <a
                href="https://www.facebook.com/profile.php?id=61590238634912"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialIconLink}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={styles.socialIcon}
                  fill="currentColor"
                >
                  <path d="M13.3 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.2-1.5 1.5-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.2v2.2H7.3V13h2.8v8h3.2Z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/jeroen-stahlecker-369604136/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.socialIconLink}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={styles.socialIcon}
                  fill="currentColor"
                >
                  <path d="M6.8 8.6a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM5.2 20V10.2h3.2V20H5.2Zm5 0V10.2h3.1v1.3h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V20h-3.2v-4.6c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V20h-3.5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
