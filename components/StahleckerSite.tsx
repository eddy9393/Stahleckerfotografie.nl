"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/app/page.module.css";
import { supabase } from "@/lib/supabase";
import { useScrollReveal } from "@/lib/useScrollReveal";
import {
  DEFAULT_SITE_CONTENT,
  SiteContent,
  SiteContentKey,
  TEXT_SECTIONS,
  TextSectionId,
} from "@/lib/siteContent";

const NAV_ITEMS = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Fotografieworkshop", href: "#workshop" },
  { label: "Over mij", href: "#over-mij" },
  { label: "Vraag een offerte aan", href: "#offerte" },
];

const CATEGORIES = [
  { value: "belangrijke-momenten", label: "Belangrijke momenten" },
  { value: "portretfotografie", label: "Portretfotografie" },
  { value: "workshops", label: "Workshops en fotografielessen" },
  { value: "mijn-werk", label: "Mijn werk" },
] as const;

type PortfolioPhoto = {
  id: string;
  created_at: string;
  category: string;
  title: string | null;
  alt_text: string | null;
  storage_path: string;
  sort_order: number;
  is_published: boolean;
};

type FormStatus = "idle" | "loading" | "success" | "error";

type UploadDraft = {
  id: string;
  file: File;
  title: string;
  altText: string;
};

type Props = {
  adminMode?: boolean;
  onLogout?: () => void | Promise<void>;
};

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

function PortfolioCard({
  photo,
  adminMode,
  onEdit,
  onDelete,
}: {
  photo: PortfolioPhoto;
  adminMode: boolean;
  onEdit: (photo: PortfolioPhoto) => void;
  onDelete: (photo: PortfolioPhoto) => void;
}) {
  const revealRef = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const imageUrl = supabase.storage.from("portfolio").getPublicUrl(photo.storage_path).data.publicUrl;

  return (
    <div className={`${styles.portfolioFigure} ${adminMode && !photo.is_published ? styles.portfolioHidden : ""}`}>
      <div ref={revealRef} className={styles.portfolioItem}>
        {/* Supabase Storage levert een externe URL. Een gewone img voorkomt extra Next image-configuratie. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={photo.alt_text || photo.title || "Portfoliofoto Stahlecker Fotografie"}
          className={styles.portfolioImgDynamic}
        />

        {(photo.title || photo.alt_text) && (
          <div className={styles.portfolioHoverInfo}>
            {photo.title && <strong className={styles.portfolioHoverTitle}>{photo.title}</strong>}
            {photo.alt_text && <span className={styles.portfolioHoverAlt}>{photo.alt_text}</span>}
          </div>
        )}

        {adminMode && (
          <div className={styles.photoAdminActions}>
            <button type="button" onClick={() => onEdit(photo)} className={styles.inlineAdminButton}>
              Wijzig foto
            </button>
            <button
              type="button"
              onClick={() => onDelete(photo)}
              className={`${styles.inlineAdminButton} ${styles.inlineAdminDanger}`}
            >
              Verwijder
            </button>
          </div>
        )}

        {adminMode && !photo.is_published && (
          <span className={styles.hiddenBadge}>Verborgen</span>
        )}
      </div>
    </div>
  );
}

export default function StahleckerSite({ adminMode = false, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toegangGecontroleerd, setToegangGecontroleerd] = useState(adminMode);
  const [volledigeSite, setVolledigeSite] = useState(adminMode);
  const [toegangscode, setToegangscode] = useState("");
  const [toegangsfout, setToegangsfout] = useState("");

  const [content, setContent] = useState<SiteContent>({ ...DEFAULT_SITE_CONTENT });
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [siteError, setSiteError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [dienst, setDienst] = useState("");
  const [bericht, setBericht] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [foutmelding, setFoutmelding] = useState("");

  const [textEditor, setTextEditor] = useState<TextSectionId | null>(null);
  const [textDraft, setTextDraft] = useState<Partial<SiteContent>>({});
  const [savingText, setSavingText] = useState(false);

  const [uploadCategory, setUploadCategory] = useState<string | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);
  const [publishUploads, setPublishUploads] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const [editingPhoto, setEditingPhoto] = useState<PortfolioPhoto | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoPublished, setPhotoPublished] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    if (adminMode) {
      setVolledigeSite(true);
      setToegangGecontroleerd(true);
      return;
    }

    const heeftToegang = window.localStorage.getItem("stahlecker-volledige-site") === "true";
    setVolledigeSite(heeftToegang);
    setToegangGecontroleerd(true);
  }, [adminMode]);

  useEffect(() => {
    void loadContent();
    void loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode]);

  async function loadContent() {
    const { data, error } = await supabase.from("site_content").select("key,value");

    if (error) {
      if (adminMode) setSiteError(`Teksten konden niet worden geladen: ${error.message}`);
      return;
    }

    const next: SiteContent = { ...DEFAULT_SITE_CONTENT };
    for (const row of data ?? []) {
      if (row.key in next) {
        next[row.key as SiteContentKey] = row.value;
      }
    }
    setContent(next);
  }

  async function loadPhotos() {
    let query = supabase
      .from("portfolio_photos")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!adminMode) query = query.eq("is_published", true);

    const { data, error } = await query;
    if (error) {
      if (adminMode) setSiteError(`Foto's konden niet worden geladen: ${error.message}`);
      return;
    }

    setPhotos(data ?? []);
  }

  const groupedPhotos = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        photos: photos.filter((photo) => photo.category === category.value),
      })),
    [photos]
  );

  function handleToegang(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (toegangscode === "Stah2026!") {
      window.localStorage.setItem("stahlecker-volledige-site", "true");
      setVolledigeSite(true);
      setToegangscode("");
      setToegangsfout("");
      return;
    }

    setToegangsfout("Code onjuist");
  }

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

  function openTextEditor(section: TextSectionId) {
    const draft: Partial<SiteContent> = {};
    for (const field of TEXT_SECTIONS[section].fields) {
      draft[field.key] = content[field.key];
    }
    setTextDraft(draft);
    setTextEditor(section);
    setAdminMessage("");
    setSiteError("");
  }

  async function saveTextSection() {
    if (!textEditor) return;
    setSavingText(true);
    setSiteError("");
    setAdminMessage("");

    const rows = TEXT_SECTIONS[textEditor].fields.map((field) => ({
      key: field.key,
      value: textDraft[field.key] ?? "",
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
    if (error) {
      setSiteError(`Tekst kon niet worden opgeslagen: ${error.message}`);
      setSavingText(false);
      return;
    }

    setContent((current) => ({ ...current, ...textDraft } as SiteContent));
    setTextEditor(null);
    setAdminMessage("Teksten zijn opgeslagen.");
    setSavingText(false);
  }

  function openUpload(category: string) {
    setUploadCategory(category);
    setUploadDrafts([]);
    setPublishUploads(true);
    setUploadProgress("");
    setSiteError("");
    setAdminMessage("");
  }

  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      title: "",
      altText: "",
    }));
    setUploadDrafts(selected);
  }

  async function uploadPhotos() {
    if (!uploadCategory || uploadDrafts.length === 0) {
      setSiteError("Kies minimaal één foto.");
      return;
    }

    const invalid = uploadDrafts.find(
      (item) =>
        !["image/jpeg", "image/png", "image/webp"].includes(item.file.type) ||
        item.file.size > 15 * 1024 * 1024
    );

    if (invalid) {
      setSiteError(`Controleer ${invalid.file.name}: alleen JPG, PNG of WebP tot 15 MB is toegestaan.`);
      return;
    }

    setUploading(true);
    setSiteError("");
    setAdminMessage("");

    const categoryPhotos = photos.filter((photo) => photo.category === uploadCategory);
    let nextSortOrder =
      categoryPhotos.length === 0
        ? 0
        : Math.max(...categoryPhotos.map((photo) => photo.sort_order)) + 1;

    for (let index = 0; index < uploadDrafts.length; index += 1) {
      const draft = uploadDrafts[index];
      setUploadProgress(`Foto ${index + 1} van ${uploadDrafts.length} uploaden…`);

      const safeName = sanitizeFileName(draft.file.name);
      const storagePath = `${uploadCategory}/${crypto.randomUUID()}-${safeName}`;

      const { error: storageError } = await supabase.storage
        .from("portfolio")
        .upload(storagePath, draft.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: draft.file.type,
        });

      if (storageError) {
        setSiteError(`Uploaden van ${draft.file.name} mislukt: ${storageError.message}`);
        setUploading(false);
        setUploadProgress("");
        await loadPhotos();
        return;
      }

      const { error: insertError } = await supabase.from("portfolio_photos").insert({
        category: uploadCategory,
        title: draft.title.trim() || null,
        alt_text: draft.altText.trim() || null,
        storage_path: storagePath,
        sort_order: nextSortOrder,
        is_published: publishUploads,
      });

      if (insertError) {
        await supabase.storage.from("portfolio").remove([storagePath]);
        setSiteError(`Opslaan van ${draft.file.name} mislukt: ${insertError.message}`);
        setUploading(false);
        setUploadProgress("");
        await loadPhotos();
        return;
      }

      nextSortOrder += 1;
    }

    await loadPhotos();
    setUploadCategory(null);
    setUploadDrafts([]);
    setUploadProgress("");
    setUploading(false);
    setAdminMessage(`${uploadDrafts.length} foto${uploadDrafts.length === 1 ? "" : "'s"} toegevoegd.`);
  }

  function openPhotoEditor(photo: PortfolioPhoto) {
    setEditingPhoto(photo);
    setPhotoTitle(photo.title ?? "");
    setPhotoAlt(photo.alt_text ?? "");
    setPhotoPublished(photo.is_published);
    setSiteError("");
    setAdminMessage("");
  }

  async function savePhoto() {
    if (!editingPhoto) return;
    setSavingPhoto(true);
    setSiteError("");

    const { error } = await supabase
      .from("portfolio_photos")
      .update({
        title: photoTitle.trim() || null,
        alt_text: photoAlt.trim() || null,
        is_published: photoPublished,
      })
      .eq("id", editingPhoto.id);

    if (error) {
      setSiteError(`Foto kon niet worden aangepast: ${error.message}`);
      setSavingPhoto(false);
      return;
    }

    await loadPhotos();
    setEditingPhoto(null);
    setSavingPhoto(false);
    setAdminMessage("Foto is aangepast.");
  }

  async function deletePhoto(photo: PortfolioPhoto) {
    const confirmed = window.confirm("Weet je zeker dat je deze foto definitief wilt verwijderen?");
    if (!confirmed) return;

    setSiteError("");
    setAdminMessage("");

    const { error: storageError } = await supabase.storage.from("portfolio").remove([photo.storage_path]);
    if (storageError) {
      setSiteError(`Bestand kon niet worden verwijderd: ${storageError.message}`);
      return;
    }

    const { error: dbError } = await supabase.from("portfolio_photos").delete().eq("id", photo.id);
    if (dbError) {
      setSiteError(`Database kon niet worden bijgewerkt: ${dbError.message}`);
      return;
    }

    if (editingPhoto?.id === photo.id) setEditingPhoto(null);
    await loadPhotos();
    setAdminMessage("Foto is verwijderd.");
  }

  if (!toegangGecontroleerd || (!volledigeSite && !adminMode)) {
    return (
      <div className={`${styles.pagina} ${styles.placeholderPagina}`}>
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

            <form className={styles.accessForm} onSubmit={handleToegang}>
              <label htmlFor="toegangscode" className={styles.accessLabel}>
                Toegang
              </label>
              <div className={styles.accessControls}>
                <input
                  id="toegangscode"
                  type="text"
                  value={toegangscode}
                  onChange={(e) => {
                    setToegangscode(e.target.value);
                    if (toegangsfout) setToegangsfout("");
                  }}
                  className={styles.accessInput}
                  placeholder="Code"
                  autoComplete="current-password"
                  aria-invalid={Boolean(toegangsfout)}
                  aria-describedby={toegangsfout ? "toegangsfout" : undefined}
                />
                <button type="submit" className={styles.accessButton}>
                  Bekijken
                </button>
              </div>
              {toegangsfout && (
                <span id="toegangsfout" className={styles.accessError}>
                  {toegangsfout}
                </span>
              )}
            </form>
          </div>
        </header>

        <main id="top" className={styles.placeholderMain}>
          <section className={`${styles.hero} ${styles.placeholderHero}`}>
            <div className={styles.heroInner}>
              <div className={`${styles.heroContent} ${styles.placeholderContent}`}>
                <p className={styles.heroEyebrow}>Stahlecker Fotografie</p>
                <h1 className={`${styles.heroHeadline} ${styles.placeholderHeadline}`}>
                  {content.placeholder_headline}
                </h1>
                <p className={styles.placeholderText}>
                  {content.placeholder_intro}{" "}
                  <a
                    href="https://www.facebook.com/profile.php?id=61590238634912"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.placeholderLink}
                  >
                    Facebook
                  </a>{" "}
                  of stuur een e-mail naar{" "}
                  <a href="mailto:stahlecker.fotografie@outlook.com" className={styles.placeholderLink}>
                    stahlecker.fotografie@outlook.com
                  </a>
                  .
                </p>
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
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.pagina} ${adminMode ? styles.adminMode : ""}`}>
      {adminMode && (
        <div className={styles.adminToolbar}>
          <div className={styles.adminToolbarInner}>
            <span className={styles.adminToolbarTitle}>Beheermodus — je ziet de website zoals bezoekers hem zien</span>
            <div className={styles.adminToolbarActions}>
              <button type="button" className={styles.adminToolbarButton} onClick={() => openTextEditor("placeholder")}>
                Placeholdertekst wijzigen
              </button>
              <button type="button" className={styles.adminToolbarButton} onClick={() => openTextEditor("footer")}>
                Footer wijzigen
              </button>
              <button type="button" className={styles.adminToolbarButton} onClick={() => void onLogout?.()}>
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      )}

      {adminMode && (siteError || adminMessage) && (
        <div className={`${styles.adminNotice} ${siteError ? styles.adminNoticeError : styles.adminNoticeSuccess}`}>
          {siteError || adminMessage}
        </div>
      )}

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
            onClick={() => setMenuOpen((value) => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
              {menuOpen ? <path d="M2 2 L16 16 M16 2 L2 16" /> : <path d="M1 4 H17 M1 9 H17 M1 14 H17" />}
            </svg>
          </button>
        </div>

        <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}>
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a href={item.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              {adminMode && (
                <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("hero")}>
                  Wijzig teksten
                </button>
              )}
              <p className={styles.heroEyebrow}>{content.hero_eyebrow}</p>
              <h1 className={styles.heroHeadline}>{content.hero_headline}</h1>
              <a href="#portfolio" className={styles.scrollCue}>
                <span className={styles.scrollCueLabel}>{content.hero_cta}</span>
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

        <section id="portfolio" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.portfolioHead}>
              {adminMode && (
                <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("portfolio")}>
                  Wijzig teksten
                </button>
              )}
              <p className={styles.eyebrow}>{content.portfolio_eyebrow}</p>
              <h2 className={styles.sectionHeading}>{content.portfolio_heading}</h2>
            </div>

            <div className={styles.portfolioGroups}>
              {groupedPhotos.map((group) => {
                if (!adminMode && group.photos.length === 0) return null;

                return (
                  <div key={group.value} className={styles.portfolioGroup}>
                    <div className={styles.portfolioGroupHeader}>
                      <h3 className={styles.portfolioGroupTitle}>{group.label}</h3>
                      {adminMode && (
                        <button type="button" className={styles.addPhotoButton} onClick={() => openUpload(group.value)}>
                          + Foto toevoegen
                        </button>
                      )}
                    </div>

                    {group.photos.length > 0 ? (
                      <div className={styles.portfolioGrid}>
                        {group.photos.map((photo) => (
                          <PortfolioCard
                            key={photo.id}
                            photo={photo}
                            adminMode={adminMode}
                            onEdit={openPhotoEditor}
                            onDelete={(item) => void deletePhoto(item)}
                          />
                        ))}
                      </div>
                    ) : (
                      adminMode && <p className={styles.adminEmptyPortfolio}>Nog geen foto&apos;s in dit onderdeel.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workshop" className={styles.section}>
          <div className={`${styles.container} ${styles.workshopContainer}`}>
            <div className={styles.workshopGrid}>
              <div className={styles.workshopLead}>
                {adminMode && (
                  <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("workshop")}>
                    Wijzig teksten
                  </button>
                )}
                <p className={styles.eyebrow}>{content.workshop_eyebrow}</p>
                <h2 className={styles.sectionHeading}>{content.workshop_heading}</h2>
                <p>{content.workshop_lead}</p>
              </div>

              <div className={styles.workshopBody}>
                <p>{content.workshop_body_1}</p>
                <p>{content.workshop_body_2}</p>
                <p>{content.workshop_body_3}</p>
              </div>
            </div>
          </div>
        </section>

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
                {adminMode && (
                  <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("about")}>
                    Wijzig teksten
                  </button>
                )}
                <p className={styles.eyebrow}>{content.about_eyebrow}</p>
                <h2 className={styles.sectionHeading} style={{ marginBottom: "1.25rem" }}>
                  {content.about_heading}
                </h2>
                <p>{content.about_p1}</p>
                <p>{content.about_p2}</p>
                <p>{content.about_p3}</p>
                <p>{content.about_p4}</p>
                <p>{content.about_p5}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="offerte" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.contactHeadingWrap}>
              {adminMode && (
                <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("contact")}>
                  Wijzig teksten
                </button>
              )}
              <p className={styles.eyebrow}>{content.contact_eyebrow}</p>
              <h2 className={styles.sectionHeading} style={{ marginBottom: "1.25rem" }}>
                {content.contact_heading}
              </h2>
              <p className={styles.offerteIntro}>{content.contact_intro}</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="naam">Naam</label>
                <input id="naam" name="naam" type="text" required autoComplete="name" className={styles.input} value={naam} onChange={(e) => setNaam(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" required autoComplete="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefoon">Telefoonnummer (optioneel)</label>
                <input id="telefoon" name="telefoon" type="tel" autoComplete="tel" className={styles.input} value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="dienst">Gewenste dienst</label>
                <select id="dienst" name="dienst" required className={styles.input} value={dienst} onChange={(e) => setDienst(e.target.value)}>
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
                {status === "error" && <p className={`${styles.statusMsg} ${styles.statusError}`}>{foutmelding}</p>}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <p className={styles.footerBrand}>{content.footer_brand}</p>
          <div className={styles.footerLinks}>
            <a href="mailto:stahlecker.fotografie@outlook.com" className={styles.footerEmail}>
              stahlecker.fotografie@outlook.com
            </a>
            <div className={styles.footerSocials} aria-label="Social media">
              <a href="https://www.facebook.com/profile.php?id=61590238634912" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialIconLink}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialIcon} fill="currentColor">
                  <path d="M13.3 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.2-1.5 1.5-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.2v2.2H7.3V13h2.8v8h3.2Z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/jeroen-stahlecker-369604136/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.socialIconLink}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialIcon} fill="currentColor">
                  <path d="M6.8 8.6a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM5.2 20V10.2h3.2V20H5.2Zm5 0V10.2h3.1v1.3h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V20h-3.2v-4.6c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V20h-3.5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {adminMode && textEditor && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={TEXT_SECTIONS[textEditor].title}>
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>Teksten wijzigen</p>
                <h2>{TEXT_SECTIONS[textEditor].title}</h2>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => setTextEditor(null)} aria-label="Sluiten">×</button>
            </div>

            <div className={styles.adminModalFields}>
              {TEXT_SECTIONS[textEditor].fields.map((field) => (
                <label key={field.key} className={styles.adminField}>
                  <span>{field.label}</span>
                  <textarea
                    rows={field.rows ?? 2}
                    value={textDraft[field.key] ?? ""}
                    onChange={(e) => setTextDraft((current) => ({ ...current, [field.key]: e.target.value }))}
                  />
                </label>
              ))}
            </div>

            <div className={styles.adminModalFooter}>
              <button type="button" className={styles.adminSecondaryButton} onClick={() => setTextEditor(null)}>Annuleren</button>
              <button type="button" className={styles.adminPrimaryButton} onClick={() => void saveTextSection()} disabled={savingText}>
                {savingText ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminMode && uploadCategory && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label="Foto's toevoegen">
          <div className={`${styles.adminModal} ${styles.adminModalWide}`}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>Portfolio</p>
                <h2>Foto&apos;s toevoegen</h2>
                <p className={styles.adminModalSubtext}>
                  {CATEGORIES.find((item) => item.value === uploadCategory)?.label}
                </p>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => !uploading && setUploadCategory(null)} aria-label="Sluiten">×</button>
            </div>

            <label className={styles.adminFilePicker}>
              <span>Selecteer één of meerdere foto&apos;s</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => handleFileSelection(e.target.files)} disabled={uploading} />
            </label>

            {uploadDrafts.length > 0 && (
              <div className={styles.uploadDraftList}>
                {uploadDrafts.map((draft) => (
                  <div className={styles.uploadDraftRow} key={draft.id}>
                    <div className={styles.uploadDraftPreview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(draft.file)} alt="" />
                    </div>
                    <div className={styles.uploadDraftFields}>
                      <strong>{draft.file.name}</strong>
                      <input
                        type="text"
                        placeholder="Titel (optioneel)"
                        value={draft.title}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, title: e.target.value } : item))}
                      />
                      <textarea
                        rows={2}
                        placeholder="Alt-tekst (optioneel)"
                        value={draft.altText}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, altText: e.target.value } : item))}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.removeDraftButton}
                      onClick={() => setUploadDrafts((current) => current.filter((item) => item.id !== draft.id))}
                      disabled={uploading}
                    >
                      Verwijder
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={styles.adminCheckbox}>
              <input type="checkbox" checked={publishUploads} onChange={(e) => setPublishUploads(e.target.checked)} disabled={uploading} />
              Direct publiceren
            </label>

            {uploadProgress && <p className={styles.uploadProgress}>{uploadProgress}</p>}

            <div className={styles.adminModalFooter}>
              <button type="button" className={styles.adminSecondaryButton} onClick={() => setUploadCategory(null)} disabled={uploading}>Annuleren</button>
              <button type="button" className={styles.adminPrimaryButton} onClick={() => void uploadPhotos()} disabled={uploading || uploadDrafts.length === 0}>
                {uploading ? "Uploaden…" : `${uploadDrafts.length || ""} foto${uploadDrafts.length === 1 ? "" : "'s"} uploaden`}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminMode && editingPhoto && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label="Foto wijzigen">
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>Portfolio</p>
                <h2>Foto wijzigen</h2>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => setEditingPhoto(null)} aria-label="Sluiten">×</button>
            </div>

            <div className={styles.adminModalFields}>
              <label className={styles.adminField}>
                <span>Titel</span>
                <input type="text" value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} />
              </label>
              <label className={styles.adminField}>
                <span>Alt-tekst</span>
                <textarea rows={3} value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} />
              </label>
              <label className={styles.adminCheckbox}>
                <input type="checkbox" checked={photoPublished} onChange={(e) => setPhotoPublished(e.target.checked)} />
                Gepubliceerd
              </label>
            </div>

            <div className={styles.adminModalFooterBetween}>
              <button type="button" className={styles.adminDangerButton} onClick={() => void deletePhoto(editingPhoto)} disabled={savingPhoto}>Foto verwijderen</button>
              <div className={styles.adminModalFooterActions}>
                <button type="button" className={styles.adminSecondaryButton} onClick={() => setEditingPhoto(null)}>Annuleren</button>
                <button type="button" className={styles.adminPrimaryButton} onClick={() => void savePhoto()} disabled={savingPhoto}>
                  {savingPhoto ? "Opslaan…" : "Opslaan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
