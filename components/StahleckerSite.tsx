"use client";

import { FormEvent, TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/app/page.module.css";
import { supabase } from "@/lib/supabase";
import { useScrollReveal } from "@/lib/useScrollReveal";
import {
  DEFAULT_SITE_CONTENT_EN,
  DEFAULT_SITE_CONTENT_NL,
  getDbContentKey,
  Language,
  SiteContent,
  SiteContentKey,
  TEXT_SECTIONS,
  TextSectionId,
} from "@/lib/siteContent";

const NAV_ITEMS = [
  { label: { nl: "Portfolio", en: "Portfolio" }, href: "#portfolio" },
  { label: { nl: "Fotografieworkshop", en: "Photography workshop" }, href: "#workshop" },
  { label: { nl: "Over mij", en: "About me" }, href: "#over-mij" },
  { label: { nl: "Vraag een offerte aan", en: "Request a quote" }, href: "#offerte" },
] as const;

const CATEGORIES = [
  { value: "portretfotografie", label: { nl: "Portretfotografie", en: "Portrait photography" } },
  { value: "mijn-werk", label: { nl: "Mijn werk", en: "Personal work" } },
  { value: "belangrijke-momenten", label: { nl: "Belangrijke momenten", en: "Important moments" } },
  { value: "workshops", label: { nl: "Workshops en fotografielessen", en: "Workshops and photography lessons" } },
] as const;

const REVIEW_SERVICES = [
  { value: "belangrijke-momenten", label: { nl: "Belangrijke momenten", en: "Important moments" } },
  { value: "portretfotografie", label: { nl: "Portretfotografie", en: "Portrait photography" } },
  { value: "workshops", label: { nl: "Fotografieworkshops en lessen", en: "Photography workshops and lessons" } },
] as const;

function normalizeReviewService(value: string | null) {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();

  if (["belangrijke-momenten", "belangrijke momenten", "important moments"].includes(normalized)) {
    return "belangrijke-momenten";
  }
  if (["portretfotografie", "portrait photography"].includes(normalized)) {
    return "portretfotografie";
  }
  if ([
    "workshops",
    "fotografieles",
    "fotografielessen",
    "fotografieworkshop",
    "fotografieworkshops",
    "fotografieworkshops en lessen",
    "photography workshop",
    "photography workshops",
    "photography workshops and lessons",
  ].includes(normalized)) {
    return "workshops";
  }

  return "";
}

function getReviewServiceLabel(value: string | null, language: Language) {
  const normalized = normalizeReviewService(value);
  const service = REVIEW_SERVICES.find((item) => item.value === normalized);
  return service ? service.label[language] : value ?? "";
}

const UI_TEXT = {
  nl: {
    access: "Toegang", code: "Code", view: "Bekijken", codeWrong: "Code onjuist",
    adminLogin: "Beheerlogin", admin: "Beheer", email: "E-mailadres", password: "Wachtwoord", login: "Inloggen",
    loginWrong: "E-mailadres of wachtwoord is onjuist.", noRights: "Dit account heeft geen beheerrechten.",
    close: "Sluiten", menuOpen: "Menu openen", menuClose: "Menu sluiten", mainMenu: "Hoofdmenu",
    contactVia: "of stuur een e-mail naar",
    adminMode: "Beheermodus — je ziet de website zoals bezoekers hem zien",
    editPlaceholder: "Placeholdertekst wijzigen", editFooter: "Footer wijzigen", logout: "Uitloggen", editTexts: "Wijzig teksten",
    addPhoto: "+ Foto toevoegen", editPhoto: "Wijzig foto", delete: "Verwijder", hidden: "Verborgen", emptyCategory: "Nog geen foto's in dit onderdeel.",
    textEdit: "Teksten wijzigen", cancel: "Annuleren", save: "Opslaan", saving: "Opslaan…", textsSaved: "Teksten zijn opgeslagen.",
    photosAdd: "Foto's toevoegen", selectPhotos: "Selecteer één of meerdere foto's", titleOptional: "Titel (optioneel)", altOptional: "Alt-tekst (optioneel)",
    publishDirect: "Direct publiceren", upload: "uploaden", uploading: "Uploaden…", published: "Gepubliceerd", photoDelete: "Foto verwijderen",
    photoChange: "Foto wijzigen", photoSaved: "Foto is aangepast.", photoDeleted: "Foto is verwijderd.",
    choosePhoto: "Kies minimaal één foto.", fileInvalid: "alleen JPG, PNG of WebP is toegestaan.",
    name: "Naam", phoneOptional: "Telefoonnummer (optioneel)", desiredService: "Gewenste dienst", chooseService: "Kies een dienst",
    serviceMoments: "Belangrijke momenten", servicePortrait: "Portretfotografie", serviceWorkshop: "Fotografieworkshops en lessen",
    requestLabel: "Vertel iets over je aanvraag", requestPlaceholder: "Bijvoorbeeld: waar vindt de opdracht plaats en welke datum of periode heb je in gedachten?",
    sending: "Versturen…", sendRequest: "Aanvraag versturen", success: "Bedankt! Je aanvraag is verstuurd — je krijgt zo snel mogelijk bericht.",
    sendFailed: "Versturen mislukt. Probeer het opnieuw.", connectionFailed: "Versturen mislukt. Controleer je internetverbinding en probeer het opnieuw.",
    socialMedia: "Social media", portfolioAlt: "Portfoliofoto Stahlecker Fotografie", photoTitle: "Titel", altText: "Alt-tekst",
    confirmDelete: "Weet je zeker dat je deze foto definitief wilt verwijderen?", photosLoadError: "Foto's konden niet worden geladen",
    textLoadError: "Teksten konden niet worden geladen", textSaveError: "Tekst kon niet worden opgeslagen", photoSaveError: "Foto kon niet worden aangepast",
    storageDeleteError: "Bestand kon niet worden verwijderd", dbUpdateError: "Database kon niet worden bijgewerkt",
    uploadFailed: "Uploaden mislukt", storeFailed: "Opslaan mislukt", languageNl: "Nederlands", languageEn: "Engels",
    photoAddedOne: "foto toegevoegd.", photoAddedMany: "foto's toegevoegd.", dutch: "Nederlands", english: "Engels",
    viewPhoto: "Bekijk foto", previousPhoto: "Vorige foto", nextPhoto: "Volgende foto",
    aboutPhoto: "Foto bij Over mij", chooseReplacement: "Kies een nieuwe foto", replacePhoto: "Foto vervangen", aboutPhotoSaved: "Foto bij Over mij is aangepast.",
    reviewsEyebrow: "Ervaringen", reviewsHeading: "Wat anderen zeggen", addReview: "+ Review toevoegen", editReview: "Review wijzigen",
    reviewsOn: "Reviews zichtbaar", reviewsOff: "Reviews verborgen", enableReviews: "Reviews aanzetten", disableReviews: "Reviews uitzetten",
    noReviews: "Nog geen reviews toegevoegd.", reviewQuote: "Reviewquote", reviewRole: "Dienst", reviewServicePlaceholder: "Kies een dienst (optioneel)", reviewPhoto: "Kleine foto (optioneel)",
    reviewNameRequired: "Vul een naam in.", reviewQuoteRequired: "Vul een review in.", reviewTooLong: "De review mag maximaal 250 tekens bevatten.",
    reviewSaved: "Review is opgeslagen.", reviewDeleted: "Review is verwijderd.", reviewDelete: "Review verwijderen",
    confirmReviewDelete: "Weet je zeker dat je deze review definitief wilt verwijderen?", reviewTranslationFailed: "Automatische vertaling is mislukt",
    removeCurrentPhoto: "Huidige foto verwijderen", reviewSectionUpdated: "Reviewsectie is aangepast.",
    readMore: "Meer lezen", readLess: "Minder lezen",
  },
  en: {
    access: "Access", code: "Code", view: "View", codeWrong: "Incorrect code",
    adminLogin: "Admin login", admin: "Admin", email: "Email address", password: "Password", login: "Log in",
    loginWrong: "Email address or password is incorrect.", noRights: "This account does not have admin rights.",
    close: "Close", menuOpen: "Open menu", menuClose: "Close menu", mainMenu: "Main menu",
    contactVia: "or send an email to",
    adminMode: "Admin mode — you are viewing the website as visitors see it",
    editPlaceholder: "Edit placeholder text", editFooter: "Edit footer", logout: "Log out", editTexts: "Edit text",
    addPhoto: "+ Add photo", editPhoto: "Edit photo", delete: "Delete", hidden: "Hidden", emptyCategory: "No photos in this section yet.",
    textEdit: "Edit text", cancel: "Cancel", save: "Save", saving: "Saving…", textsSaved: "Text has been saved.",
    photosAdd: "Add photos", selectPhotos: "Select one or more photos", titleOptional: "Title (optional)", altOptional: "Alt text (optional)",
    publishDirect: "Publish immediately", upload: "upload", uploading: "Uploading…", published: "Published", photoDelete: "Delete photo",
    photoChange: "Edit photo", photoSaved: "Photo has been updated.", photoDeleted: "Photo has been deleted.",
    choosePhoto: "Choose at least one photo.", fileInvalid: "only JPG, PNG or WebP is allowed.",
    name: "Name", phoneOptional: "Phone number (optional)", desiredService: "Requested service", chooseService: "Choose a service",
    serviceMoments: "Important moments", servicePortrait: "Portrait photography", serviceWorkshop: "Photography workshops and lessons",
    requestLabel: "Tell me about your request", requestPlaceholder: "For example: where will the assignment take place and what date or period do you have in mind?",
    sending: "Sending…", sendRequest: "Send request", success: "Thank you! Your request has been sent — I will get back to you as soon as possible.",
    sendFailed: "Sending failed. Please try again.", connectionFailed: "Sending failed. Check your internet connection and try again.",
    socialMedia: "Social media", portfolioAlt: "Stahlecker Photography portfolio photo", photoTitle: "Title", altText: "Alt text",
    confirmDelete: "Are you sure you want to permanently delete this photo?", photosLoadError: "Photos could not be loaded",
    textLoadError: "Text could not be loaded", textSaveError: "Text could not be saved", photoSaveError: "Photo could not be updated",
    storageDeleteError: "File could not be deleted", dbUpdateError: "Database could not be updated",
    uploadFailed: "Upload failed", storeFailed: "Saving failed", languageNl: "Dutch", languageEn: "English",
    photoAddedOne: "photo added.", photoAddedMany: "photos added.", dutch: "Dutch", english: "English",
    viewPhoto: "View photo", previousPhoto: "Previous photo", nextPhoto: "Next photo",
    aboutPhoto: "About me photo", chooseReplacement: "Choose a new photo", replacePhoto: "Replace photo", aboutPhotoSaved: "About me photo has been updated.",
    reviewsEyebrow: "Reviews", reviewsHeading: "What others say", addReview: "+ Add review", editReview: "Edit review",
    reviewsOn: "Reviews visible", reviewsOff: "Reviews hidden", enableReviews: "Enable reviews", disableReviews: "Disable reviews",
    noReviews: "No reviews have been added yet.", reviewQuote: "Review quote", reviewRole: "Service", reviewServicePlaceholder: "Choose a service (optional)", reviewPhoto: "Small photo (optional)",
    reviewNameRequired: "Enter a name.", reviewQuoteRequired: "Enter a review.", reviewTooLong: "The review may contain up to 250 characters.",
    reviewSaved: "Review has been saved.", reviewDeleted: "Review has been deleted.", reviewDelete: "Delete review",
    confirmReviewDelete: "Are you sure you want to permanently delete this review?", reviewTranslationFailed: "Automatic translation failed",
    removeCurrentPhoto: "Remove current photo", reviewSectionUpdated: "Review section has been updated.",
    readMore: "Read more", readLess: "Read less",
  },
} as const;

type PortfolioPhoto = {
  id: string;
  created_at: string;
  category: string;
  title: string | null;
  alt_text: string | null;
  title_en?: string | null;
  alt_text_en?: string | null;
  storage_path: string;
  sort_order: number;
  is_published: boolean;
};

type Review = {
  id: string;
  created_at: string;
  quote_original: string;
  name: string;
  role_original: string | null;
  source_language: string | null;
  quote_nl: string;
  role_nl: string | null;
  quote_en: string;
  role_en: string | null;
  photo_path: string | null;
  sort_order: number;
};

type FormStatus = "idle" | "loading" | "success" | "error";

type UploadDraft = {
  id: string;
  file: File;
  title: string;
  altText: string;
  titleEn: string;
  altTextEn: string;
};

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

const MAX_IMAGE_DIMENSION = 2400;
const WEBP_QUALITY = 0.84;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Afbeelding kon niet worden gelezen."));
    };

    image.src = url;
  });
}

async function optimizeImageForWeb(file: File, maxDimension = MAX_IMAGE_DIMENSION, quality = WEBP_QUALITY) {
  const image = await loadImage(file);
  const originalWidth = image.naturalWidth;
  const originalHeight = image.naturalHeight;
  const longestSide = Math.max(originalWidth, originalHeight);
  const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Afbeelding kon niet worden geoptimaliseerd.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Afbeelding kon niet naar WebP worden omgezet."));
      },
      "image/webp",
      quality
    );
  });

  const originalName = file.name.replace(/\.[^/.]+$/, "");
  const optimizedName = `${sanitizeFileName(originalName) || "foto"}.webp`;

  return new File([blob], optimizedName, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function LanguageSwitcher({
  language,
  onChange,
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <div className={styles.languageSwitcher} aria-label="Language / Taal">
      <button
        type="button"
        className={`${styles.languageButton} ${language === "nl" ? styles.languageButtonActive : ""}`}
        onClick={() => onChange("nl")}
        aria-label="Nederlands"
        aria-pressed={language === "nl"}
        title="Nederlands"
      >
        <span aria-hidden="true">🇳🇱</span>
      </button>
      <button
        type="button"
        className={`${styles.languageButton} ${language === "en" ? styles.languageButtonActive : ""}`}
        onClick={() => onChange("en")}
        aria-label="English"
        aria-pressed={language === "en"}
        title="English"
      >
        <span aria-hidden="true">🇬🇧</span>
      </button>
    </div>
  );
}

function AdminIcon({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.adminIconSvg} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.8 19.2c.8-3.4 3-5.1 6.2-5.1s5.4 1.7 6.2 5.1" />
      <path d="M18.2 5.8l1.2-1.2 1 1-1.2 1.2" />
    </svg>
  );
}

function PortfolioCard({
  photo,
  adminMode,
  language,
  onEdit,
  onDelete,
  onOpen,
}: {
  photo: PortfolioPhoto;
  adminMode: boolean;
  language: Language;
  onEdit: (photo: PortfolioPhoto) => void;
  onDelete: (photo: PortfolioPhoto) => void;
  onOpen: (photo: PortfolioPhoto) => void;
}) {
  const revealRef = useScrollReveal<HTMLDivElement>({ delay: 0 });
  const imageUrl = supabase.storage.from("portfolio").getPublicUrl(photo.storage_path).data.publicUrl;
  const t = UI_TEXT[language];
  const title = language === "en" ? photo.title_en ?? "" : photo.title ?? "";
  const altText = language === "en" ? photo.alt_text_en ?? "" : photo.alt_text ?? "";

  return (
    <div className={`${styles.portfolioFigure} ${adminMode && !photo.is_published ? styles.portfolioHidden : ""}`}>
      <div ref={revealRef} className={styles.portfolioItem}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText || title || t.portfolioAlt}
          className={styles.portfolioImgDynamic}
        />

        <button
          type="button"
          className={styles.portfolioOpenButton}
          onClick={() => onOpen(photo)}
          aria-label={`${t.viewPhoto}: ${title || altText || t.portfolioAlt}`}
        />

        {(title || altText) && (
          <div className={styles.portfolioHoverInfo}>
            {title && <strong className={styles.portfolioHoverTitle}>{title}</strong>}
            {altText && <span className={styles.portfolioHoverAlt}>{altText}</span>}
          </div>
        )}

        {adminMode && (
          <div className={styles.photoAdminActions}>
            <button type="button" onClick={() => onEdit(photo)} className={styles.inlineAdminButton}>
              {t.editPhoto}
            </button>
            <button
              type="button"
              onClick={() => onDelete(photo)}
              className={`${styles.inlineAdminButton} ${styles.inlineAdminDanger}`}
            >
              {t.delete}
            </button>
          </div>
        )}

        {adminMode && !photo.is_published && <span className={styles.hiddenBadge}>{t.hidden}</span>}
      </div>
    </div>
  );
}

export default function StahleckerSite() {
  const [language, setLanguage] = useState<Language>("nl");
  const t = UI_TEXT[language];

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [toegangGecontroleerd, setToegangGecontroleerd] = useState(false);
  const [volledigeSite, setVolledigeSite] = useState(false);
  const [toegangscode, setToegangscode] = useState("");
  const [toegangsfout, setToegangsfout] = useState("");

  const [adminMode, setAdminMode] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState("");

  const [contentByLanguage, setContentByLanguage] = useState<Record<Language, SiteContent>>({
    nl: { ...DEFAULT_SITE_CONTENT_NL },
    en: { ...DEFAULT_SITE_CONTENT_EN },
  });
  const content = contentByLanguage[language];
  const [aboutImagePath, setAboutImagePath] = useState("");
  const [aboutImageEditorOpen, setAboutImageEditorOpen] = useState(false);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [savingAboutImage, setSavingAboutImage] = useState(false);

  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [reviewEditorOpen, setReviewEditorOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewQuote, setReviewQuote] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewRole, setReviewRole] = useState("");
  const [reviewPhotoFile, setReviewPhotoFile] = useState<File | null>(null);
  const [removeReviewPhoto, setRemoveReviewPhoto] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [togglingReviews, setTogglingReviews] = useState(false);
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
  const [photoTitleEn, setPhotoTitleEn] = useState("");
  const [photoAltEn, setPhotoAltEn] = useState("");
  const [photoPublished, setPhotoPublished] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const lightboxTouchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const savedLanguage = window.localStorage.getItem("stahlecker-language");
      if (mounted && (savedLanguage === "nl" || savedLanguage === "en")) {
        setLanguage(savedLanguage);
      }

      const heeftToegang = window.localStorage.getItem("stahlecker-volledige-site") === "true";
      if (mounted) setVolledigeSite(heeftToegang);

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
        if (!adminError && isAdmin) {
          if (mounted) {
            setAdminMode(true);
            setVolledigeSite(true);
          }
        }
      }

      if (mounted) setToegangGecontroleerd(true);
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    void loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode]);

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode]);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("stahlecker-language", nextLanguage);
    setMenuOpen(false);
    setToegangsfout("");
    setAdminAuthError("");
  }

  async function handleAdminLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdminAuthLoading(true);
    setAdminAuthError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (signInError) {
      setAdminAuthError(t.loginWrong);
      setAdminAuthLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || !isAdmin) {
      await supabase.auth.signOut();
      setAdminAuthError(t.noRights);
      setAdminAuthLoading(false);
      return;
    }

    setAdminPassword("");
    setAdminMode(true);
    setVolledigeSite(true);
    setAdminLoginOpen(false);
    setAdminAuthLoading(false);
  }

  async function handleAdminLogout() {
    await supabase.auth.signOut();
    setAdminMode(false);
    setTextEditor(null);
    setUploadCategory(null);
    setEditingPhoto(null);
    setEditingReview(null);
    setReviewEditorOpen(false);
    setAdminMessage("");
    setSiteError("");
    const heeftToegang = window.localStorage.getItem("stahlecker-volledige-site") === "true";
    setVolledigeSite(heeftToegang);
  }

  async function loadContent() {
    const { data, error } = await supabase.from("site_content").select("key,value");

    if (error) {
      if (adminMode) setSiteError(`${t.textLoadError}: ${error.message}`);
      return;
    }

    const nextNl: SiteContent = { ...DEFAULT_SITE_CONTENT_NL };
    const nextEn: SiteContent = { ...DEFAULT_SITE_CONTENT_EN };
    let nextAboutImagePath = "";

    for (const row of data ?? []) {
      const rawKey = String(row.key);

      if (rawKey === "about_image_path") {
        nextAboutImagePath = String(row.value ?? "");
        continue;
      }

      const isEnglish = rawKey.endsWith("_en");
      const baseKey = (isEnglish ? rawKey.slice(0, -3) : rawKey) as SiteContentKey;
      const target = isEnglish ? nextEn : nextNl;

      if (baseKey in target) {
        target[baseKey] = row.value;
      }
    }

    setContentByLanguage({ nl: nextNl, en: nextEn });
    setAboutImagePath(nextAboutImagePath);
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
      if (adminMode) setSiteError(`${t.photosLoadError}: ${error.message}`);
      return;
    }

    setPhotos(data ?? []);
  }

  async function loadReviews() {
    const [reviewsResult, settingsResult] = await Promise.all([
      supabase.from("reviews").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("review_settings").select("section_enabled").eq("id", 1).maybeSingle(),
    ]);

    if (reviewsResult.error) {
      if (adminMode) setSiteError(`Reviews konden niet worden geladen: ${reviewsResult.error.message}`);
      return;
    }

    if (settingsResult.error) {
      if (adminMode) setSiteError(`Reviewinstelling kon niet worden geladen: ${settingsResult.error.message}`);
      return;
    }

    setReviews((reviewsResult.data ?? []) as Review[]);
    setReviewsEnabled(settingsResult.data?.section_enabled ?? true);
  }

  const groupedPhotos = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        photos: photos.filter((photo) => photo.category === category.value),
      })),
    [photos]
  );

  const lightboxPhotos = useMemo(
    () => groupedPhotos.flatMap((group) => group.photos),
    [groupedPhotos]
  );

  const lightboxIndex = lightboxPhotoId
    ? lightboxPhotos.findIndex((photo) => photo.id === lightboxPhotoId)
    : -1;

  const lightboxPhoto = lightboxIndex >= 0 ? lightboxPhotos[lightboxIndex] : null;

  function openLightbox(photo: PortfolioPhoto) {
    setLightboxPhotoId(photo.id);
  }

  function closeLightbox() {
    setLightboxPhotoId(null);
  }

  function showLightboxPhoto(direction: -1 | 1) {
    if (lightboxPhotos.length < 2 || lightboxIndex < 0) return;
    const nextIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
    setLightboxPhotoId(lightboxPhotos[nextIndex].id);
  }

  function handleLightboxTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      lightboxTouchStart.current = null;
      return;
    }

    lightboxTouchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  function handleLightboxTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = lightboxTouchStart.current;
    lightboxTouchStart.current = null;

    if (!start || event.changedTouches.length === 0) return;

    const end = event.changedTouches[0];
    const deltaX = end.clientX - start.x;
    const deltaY = end.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 55 && absY < 70) return;

    if (absX > absY * 1.15) {
      if (lightboxPhotos.length > 1) {
        showLightboxPhoto(deltaX < 0 ? 1 : -1);
      }
      return;
    }

    if (absY > absX * 1.15 && absY >= 70) {
      closeLightbox();
    }
  }

  useEffect(() => {
    if (!lightboxPhotoId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxPhotoId(null);
        return;
      }

      if (lightboxPhotos.length < 2 || lightboxIndex < 0) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        const nextIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
        setLightboxPhotoId(lightboxPhotos[nextIndex].id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxPhotoId, lightboxIndex, lightboxPhotos]);

  function handleToegang(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (toegangscode === "Stah2026!") {
      window.localStorage.setItem("stahlecker-volledige-site", "true");
      setVolledigeSite(true);
      setToegangscode("");
      setToegangsfout("");
      return;
    }

    setToegangsfout(t.codeWrong);
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
        setFoutmelding(language === "en" ? t.sendFailed : data.error ?? t.sendFailed);
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
      setFoutmelding(t.connectionFailed);
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
      key: getDbContentKey(field.key, language),
      value: textDraft[field.key] ?? "",
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
    if (error) {
      setSiteError(`${t.textSaveError}: ${error.message}`);
      setSavingText(false);
      return;
    }

    setContentByLanguage((current) => ({
      ...current,
      [language]: { ...current[language], ...textDraft } as SiteContent,
    }));
    setTextEditor(null);
    setAdminMessage(t.textsSaved);
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
      titleEn: "",
      altTextEn: "",
    }));
    setUploadDrafts(selected);
  }

  async function uploadPhotos() {
    if (!uploadCategory || uploadDrafts.length === 0) {
      setSiteError(t.choosePhoto);
      return;
    }

    const invalid = uploadDrafts.find(
      (item) => !["image/jpeg", "image/png", "image/webp"].includes(item.file.type)
    );

    if (invalid) {
      setSiteError(`${invalid.file.name}: ${t.fileInvalid}`);
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
      setUploadProgress(
        language === "nl"
          ? `Foto ${index + 1} van ${uploadDrafts.length} optimaliseren…`
          : `Optimizing photo ${index + 1} of ${uploadDrafts.length}…`
      );

      let optimizedFile: File;
      try {
        optimizedFile = await optimizeImageForWeb(draft.file);
      } catch (optimizationError) {
        const message = optimizationError instanceof Error ? optimizationError.message : t.uploadFailed;
        setSiteError(`${draft.file.name}: ${message}`);
        setUploading(false);
        setUploadProgress("");
        return;
      }

      if (optimizedFile.size > 15 * 1024 * 1024) {
        setSiteError(`${draft.file.name}: ${t.fileInvalid}`);
        setUploading(false);
        setUploadProgress("");
        return;
      }

      setUploadProgress(
        language === "nl"
          ? `Foto ${index + 1} van ${uploadDrafts.length} uploaden…`
          : `Uploading photo ${index + 1} of ${uploadDrafts.length}…`
      );

      const safeName = sanitizeFileName(optimizedFile.name);
      const storagePath = `${uploadCategory}/${crypto.randomUUID()}-${safeName}`;

      const { error: storageError } = await supabase.storage
        .from("portfolio")
        .upload(storagePath, optimizedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: optimizedFile.type,
        });

      if (storageError) {
        setSiteError(`${t.uploadFailed} (${draft.file.name}): ${storageError.message}`);
        setUploading(false);
        setUploadProgress("");
        await loadPhotos();
        return;
      }

      const { error: insertError } = await supabase.from("portfolio_photos").insert({
        category: uploadCategory,
        title: draft.title.trim() || null,
        alt_text: draft.altText.trim() || null,
        title_en: draft.titleEn.trim() || null,
        alt_text_en: draft.altTextEn.trim() || null,
        storage_path: storagePath,
        sort_order: nextSortOrder,
        is_published: publishUploads,
      });

      if (insertError) {
        await supabase.storage.from("portfolio").remove([storagePath]);
        setSiteError(`${t.storeFailed} (${draft.file.name}): ${insertError.message}`);
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
    setAdminMessage(`${uploadDrafts.length} ${uploadDrafts.length === 1 ? t.photoAddedOne : t.photoAddedMany}`);
  }

  function openPhotoEditor(photo: PortfolioPhoto) {
    setEditingPhoto(photo);
    setPhotoTitle(photo.title ?? "");
    setPhotoAlt(photo.alt_text ?? "");
    setPhotoTitleEn(photo.title_en ?? "");
    setPhotoAltEn(photo.alt_text_en ?? "");
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
        title_en: photoTitleEn.trim() || null,
        alt_text_en: photoAltEn.trim() || null,
        is_published: photoPublished,
      })
      .eq("id", editingPhoto.id);

    if (error) {
      setSiteError(`${t.photoSaveError}: ${error.message}`);
      setSavingPhoto(false);
      return;
    }

    await loadPhotos();
    setEditingPhoto(null);
    setSavingPhoto(false);
    setAdminMessage(t.photoSaved);
  }

  async function deletePhoto(photo: PortfolioPhoto) {
    const confirmed = window.confirm(t.confirmDelete);
    if (!confirmed) return;

    setSiteError("");
    setAdminMessage("");

    const { error: storageError } = await supabase.storage.from("portfolio").remove([photo.storage_path]);
    if (storageError) {
      setSiteError(`${t.storageDeleteError}: ${storageError.message}`);
      return;
    }

    const { error: dbError } = await supabase.from("portfolio_photos").delete().eq("id", photo.id);
    if (dbError) {
      setSiteError(`${t.dbUpdateError}: ${dbError.message}`);
      return;
    }

    if (editingPhoto?.id === photo.id) setEditingPhoto(null);
    await loadPhotos();
    setAdminMessage(t.photoDeleted);
  }

  function openNewReview() {
    setEditingReview(null);
    setReviewQuote("");
    setReviewName("");
    setReviewRole("");
    setReviewPhotoFile(null);
    setRemoveReviewPhoto(false);
    setSiteError("");
    setAdminMessage("");
    setReviewEditorOpen(true);
  }

  function openReviewEditor(review: Review) {
    setEditingReview(review);
    setReviewQuote(review.quote_original);
    setReviewName(review.name);
    setReviewRole(normalizeReviewService(review.role_original));
    setReviewPhotoFile(null);
    setRemoveReviewPhoto(false);
    setSiteError("");
    setAdminMessage("");
    setReviewEditorOpen(true);
  }


  async function saveReview() {
    const quote = reviewQuote.trim();
    const name = reviewName.trim();
    const role = reviewRole.trim();

    if (!quote) {
      setSiteError(t.reviewQuoteRequired);
      return;
    }
    if (quote.length > 250) {
      setSiteError(t.reviewTooLong);
      return;
    }
    if (!name) {
      setSiteError(t.reviewNameRequired);
      return;
    }
    if (reviewPhotoFile && !["image/jpeg", "image/png", "image/webp"].includes(reviewPhotoFile.type)) {
      setSiteError(`${reviewPhotoFile.name}: ${t.fileInvalid}`);
      return;
    }

    setSavingReview(true);
    setSiteError("");
    setAdminMessage("");

    let newPhotoPath: string | null = null;
    if (reviewPhotoFile) {
      try {
        const optimizedPhoto = await optimizeImageForWeb(reviewPhotoFile, 640, 0.84);
        const safeName = sanitizeFileName(optimizedPhoto.name);
        newPhotoPath = `reviews/${crypto.randomUUID()}-${safeName}`;

        const { error: storageError } = await supabase.storage
          .from("portfolio")
          .upload(newPhotoPath, optimizedPhoto, {
            cacheControl: "3600",
            upsert: false,
            contentType: optimizedPhoto.type,
          });

        if (storageError) throw storageError;
      } catch (error) {
        const message = error instanceof Error ? error.message : t.uploadFailed;
        setSiteError(`${t.uploadFailed}: ${message}`);
        setSavingReview(false);
        return;
      }
    }

    const previousPhotoPath = editingReview?.photo_path ?? null;
    const photoPath = newPhotoPath ?? (removeReviewPhoto ? null : previousPhotoPath);

    const roleNl = role ? getReviewServiceLabel(role, "nl") : null;
    const roleEn = role ? getReviewServiceLabel(role, "en") : null;

    const payload = {
      quote_original: quote,
      name,
      role_original: role || null,
      source_language: null,
      // De reviewquote zelf wordt niet vertaald. De dienst is een vaste keuze
      // en krijgt alleen het bestaande NL/EN-label van de website.
      quote_nl: quote,
      role_nl: roleNl,
      quote_en: quote,
      role_en: roleEn,
      photo_path: photoPath,
    };

    let dbError = null;
    if (editingReview) {
      const result = await supabase.from("reviews").update(payload).eq("id", editingReview.id);
      dbError = result.error;
    } else {
      const nextSortOrder = reviews.length === 0 ? 0 : Math.max(...reviews.map((review) => review.sort_order)) + 1;
      const result = await supabase.from("reviews").insert({ ...payload, sort_order: nextSortOrder });
      dbError = result.error;
    }

    if (dbError) {
      if (newPhotoPath) await supabase.storage.from("portfolio").remove([newPhotoPath]);
      setSiteError(`${t.storeFailed}: ${dbError.message}`);
      setSavingReview(false);
      return;
    }

    if (previousPhotoPath && previousPhotoPath !== photoPath) {
      await supabase.storage.from("portfolio").remove([previousPhotoPath]);
    }

    await loadReviews();
    setReviewEditorOpen(false);
    setEditingReview(null);
    setReviewPhotoFile(null);
    setSavingReview(false);
    setAdminMessage(t.reviewSaved);
  }

  async function deleteReview(review: Review) {
    if (!window.confirm(t.confirmReviewDelete)) return;

    setSiteError("");
    setAdminMessage("");

    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    if (error) {
      setSiteError(`${t.dbUpdateError}: ${error.message}`);
      return;
    }

    if (review.photo_path) {
      await supabase.storage.from("portfolio").remove([review.photo_path]);
    }

    setReviewEditorOpen(false);
    setEditingReview(null);
    await loadReviews();
    setAdminMessage(t.reviewDeleted);
  }

  async function toggleReviewsSection() {
    setTogglingReviews(true);
    setSiteError("");
    setAdminMessage("");

    const nextValue = !reviewsEnabled;
    const { error } = await supabase
      .from("review_settings")
      .update({ section_enabled: nextValue, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      setSiteError(`${t.dbUpdateError}: ${error.message}`);
      setTogglingReviews(false);
      return;
    }

    setReviewsEnabled(nextValue);
    setTogglingReviews(false);
    setAdminMessage(t.reviewSectionUpdated);
  }

  async function saveAboutImage() {
    if (!aboutImageFile) {
      setSiteError(t.choosePhoto);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(aboutImageFile.type)) {
      setSiteError(`${aboutImageFile.name}: ${t.fileInvalid}`);
      return;
    }

    setSavingAboutImage(true);
    setSiteError("");
    setAdminMessage("");

    let optimizedAboutImage: File;
    try {
      optimizedAboutImage = await optimizeImageForWeb(aboutImageFile);
    } catch (optimizationError) {
      const message = optimizationError instanceof Error ? optimizationError.message : t.uploadFailed;
      setSiteError(`${aboutImageFile.name}: ${message}`);
      setSavingAboutImage(false);
      return;
    }

    if (optimizedAboutImage.size > 15 * 1024 * 1024) {
      setSiteError(`${aboutImageFile.name}: ${t.fileInvalid}`);
      setSavingAboutImage(false);
      return;
    }

    const safeName = sanitizeFileName(optimizedAboutImage.name);
    const storagePath = `site/about/${crypto.randomUUID()}-${safeName}`;

    const { error: storageError } = await supabase.storage
      .from("portfolio")
      .upload(storagePath, optimizedAboutImage, {
        cacheControl: "3600",
        upsert: false,
        contentType: optimizedAboutImage.type,
      });

    if (storageError) {
      setSiteError(`${t.uploadFailed}: ${storageError.message}`);
      setSavingAboutImage(false);
      return;
    }

    const { error: contentError } = await supabase.from("site_content").upsert(
      {
        key: "about_image_path",
        value: storagePath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (contentError) {
      await supabase.storage.from("portfolio").remove([storagePath]);
      setSiteError(`${t.storeFailed}: ${contentError.message}`);
      setSavingAboutImage(false);
      return;
    }

    const previousPath = aboutImagePath;
    setAboutImagePath(storagePath);
    setAboutImageFile(null);
    setAboutImageEditorOpen(false);
    setSavingAboutImage(false);
    setAdminMessage(t.aboutPhotoSaved);

    if (previousPath) {
      await supabase.storage.from("portfolio").remove([previousPath]);
    }
  }

  const adminLoginModal = adminLoginOpen && !adminMode ? (
    <div className={styles.adminLoginBackdrop} role="dialog" aria-modal="true" aria-label={t.adminLogin}>
      <div className={styles.adminLoginModal}>
        <div className={styles.adminModalHead}>
          <div>
            <p className={styles.adminModalEyebrow}>Stahlecker Fotografie</p>
            <h2>{t.admin}</h2>
          </div>
          <button
            type="button"
            className={styles.adminModalClose}
            onClick={() => !adminAuthLoading && setAdminLoginOpen(false)}
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        <form className={styles.adminLoginForm} onSubmit={handleAdminLogin}>
          <label className={styles.adminField}>
            <span>{t.email}</span>
            <input
              type="email"
              autoComplete="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className={styles.adminField}>
            <span>{t.password}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </label>
          {adminAuthError && <p className={styles.adminLoginError}>{adminAuthError}</p>}
          <button type="submit" className={styles.adminPrimaryButton} disabled={adminAuthLoading}>
            {adminAuthLoading ? (language === "nl" ? "Inloggen…" : "Logging in…") : t.login}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  if (!toegangGecontroleerd || (!volledigeSite && !adminMode)) {
    return (
      <div className={`${styles.pagina} ${styles.placeholderPagina}`}>
        <header className={styles.header}>
          <div className={`${styles.headerInner} ${styles.placeholderHeaderInner}`}>
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

            <div className={styles.placeholderHeaderActions}>
              <div className={styles.headerUtilities}>
                <LanguageSwitcher language={language} onChange={changeLanguage} />
                <button
                  type="button"
                  className={styles.adminIconButton}
                  onClick={() => { setAdminAuthError(""); setAdminLoginOpen(true); }}
                  aria-label={t.adminLogin}
                  title={t.adminLogin}
                >
                  <AdminIcon label={t.adminLogin} />
                </button>
              </div>

              <form className={styles.accessForm} onSubmit={handleToegang}>
                <label htmlFor="toegangscode" className={styles.accessLabel}>
                  {t.access}
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
                    placeholder={t.code}
                    autoComplete="current-password"
                    aria-invalid={Boolean(toegangsfout)}
                    aria-describedby={toegangsfout ? "toegangsfout" : undefined}
                  />
                  <button type="submit" className={styles.accessButton}>
                    {t.view}
                  </button>
                </div>
                {toegangsfout && (
                  <span id="toegangsfout" className={styles.accessError}>
                    {toegangsfout}
                  </span>
                )}
              </form>
            </div>
          </div>
        </header>

        <main id="top" className={styles.placeholderMain}>
          <section className={`${styles.hero} ${styles.placeholderHero}`}>
            <div className={styles.heroInner}>
              <div className={`${styles.heroContent} ${styles.placeholderContent}`}>
                <p className={styles.heroEyebrow}>{content.hero_eyebrow}</p>
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
                  {t.contactVia}{" "}
                  <a href="mailto:stahlecker.fotografie@outlook.com" className={styles.placeholderLink}>
                    stahlecker.fotografie@outlook.com
                  </a>
                  .
                </p>
              </div>

              <div className={styles.heroImageWrap}>
                <Image
                  src="/stahlecker/hero-jeroen.jpg"
                  alt={language === "nl" ? "Portret van fotograaf Jeroen Stahlecker met camera" : "Portrait of photographer Jeroen Stahlecker holding a camera"}
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
        {adminLoginModal}
      </div>
    );
  }

  return (
    <div className={`${styles.pagina} ${adminMode ? styles.adminMode : ""}`}>
      {adminMode && (
        <div className={styles.adminToolbar}>
          <div className={styles.adminToolbarInner}>
            <span className={styles.adminToolbarTitle}>{t.adminMode}</span>
            <div className={styles.adminToolbarActions}>
              <button type="button" className={styles.adminToolbarButton} onClick={() => openTextEditor("placeholder")}>
                {t.editPlaceholder}
              </button>
              <button type="button" className={styles.adminToolbarButton} onClick={() => openTextEditor("footer")}>
                {t.editFooter}
              </button>
              <button type="button" className={styles.adminToolbarButton} onClick={() => void handleAdminLogout()}>
                {t.logout}
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

          <nav className={styles.nav} aria-label={t.mainMenu}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={styles.navLink}>
                    {item.label[language]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.headerUtilities}>
            <LanguageSwitcher language={language} onChange={changeLanguage} />
            <button
              type="button"
              className={`${styles.adminIconButton} ${adminMode ? styles.adminIconButtonActive : ""}`}
              onClick={() => { if (!adminMode) { setAdminAuthError(""); setAdminLoginOpen(true); } }}
              aria-label={adminMode ? t.adminMode : t.adminLogin}
              title={adminMode ? t.admin : t.adminLogin}
            >
              <AdminIcon label={t.adminLogin} />
            </button>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={menuOpen ? t.menuClose : t.menuOpen}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
                {menuOpen ? <path d="M2 2 L16 16 M16 2 L2 16" /> : <path d="M1 4 H17 M1 9 H17 M1 14 H17" />}
              </svg>
            </button>
          </div>
        </div>

        <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}>
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                  {item.label[language]}
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
                  {t.editTexts}
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
                alt={language === "nl" ? "Portret van fotograaf Jeroen Stahlecker met camera" : "Portrait of photographer Jeroen Stahlecker holding a camera"}
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
                  {t.editTexts}
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
                      <h3 className={styles.portfolioGroupTitle}>{group.label[language]}</h3>
                      {adminMode && (
                        <button type="button" className={styles.addPhotoButton} onClick={() => openUpload(group.value)}>
                          {t.addPhoto}
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
                            language={language}
                            onEdit={openPhotoEditor}
                            onDelete={(item) => void deletePhoto(item)}
                            onOpen={openLightbox}
                          />
                        ))}
                      </div>
                    ) : (
                      adminMode && <p className={styles.adminEmptyPortfolio}>{t.emptyCategory}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workshop" className={`${styles.section} ${styles.workshopSection}`}>
          <div className={styles.workshopInner}>
            <div className={styles.workshopGrid}>
              <div className={styles.workshopLead}>
                {adminMode && (
                  <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("workshop")}>
                    {t.editTexts}
                  </button>
                )}
                <p className={styles.eyebrow}>{content.workshop_eyebrow}</p>
                <h2 className={styles.sectionHeading}>{content.workshop_heading}</h2>
                <p>{content.workshop_lead}</p>
              </div>

              <div className={styles.workshopBody}>
                <p>{content.workshop_body_1}</p>
                <p>{content.workshop_body_2}</p>
                {content.workshop_body_3 && <p>{content.workshop_body_3}</p>}
              </div>
            </div>
          </div>
        </section>

        <section id="over-mij" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.overMijGrid}>
              <div className={styles.overMijImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    aboutImagePath
                      ? supabase.storage.from("portfolio").getPublicUrl(aboutImagePath).data.publicUrl
                      : "/stahlecker/over-mij-jeroen.jpg"
                  }
                  alt="Jeroen Stahlecker"
                  className={styles.overMijImg}
                />
                {adminMode && (
                  <button
                    type="button"
                    className={styles.overMijImageEditButton}
                    onClick={() => {
                      setAboutImageFile(null);
                      setSiteError("");
                      setAdminMessage("");
                      setAboutImageEditorOpen(true);
                    }}
                  >
                    {t.editPhoto}
                  </button>
                )}
              </div>

              <div className={styles.overMijTekst}>
                {adminMode && (
                  <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("about")}>
                    {t.editTexts}
                  </button>
                )}
                <p className={styles.eyebrow}>{content.about_eyebrow}</p>
                <h2 className={styles.sectionHeading} style={{ marginBottom: "1.25rem" }}>
                  {content.about_heading}
                </h2>
                <p>{content.about_p1}</p>
                <p>{content.about_p2}</p>
                {aboutExpanded && (
                  <>
                    <p>{content.about_p3}</p>
                    <p>{content.about_p4}</p>
                    <p>{content.about_p5}</p>
                  </>
                )}
                {(content.about_p3 || content.about_p4 || content.about_p5) && (
                  <button
                    type="button"
                    className={styles.readMoreButton}
                    onClick={() => setAboutExpanded((current) => !current)}
                    aria-expanded={aboutExpanded}
                  >
                    {aboutExpanded ? t.readLess : t.readMore}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {((reviewsEnabled && reviews.length > 0) || adminMode) && (
          <section className={`${styles.section} ${styles.reviewsSection} ${!reviewsEnabled ? styles.reviewsSectionDisabled : ""}`}>
            <div className={styles.container}>
              <div className={styles.reviewsHeader}>
                <div>
                  <p className={styles.eyebrow}>{t.reviewsEyebrow}</p>
                  <h2 className={styles.sectionHeading}>{t.reviewsHeading}</h2>
                </div>

                {adminMode && (
                  <div className={styles.reviewsAdminActions}>
                    <button
                      type="button"
                      className={styles.inlineAdminButton}
                      onClick={() => void toggleReviewsSection()}
                      disabled={togglingReviews}
                    >
                      {reviewsEnabled ? t.disableReviews : t.enableReviews}
                    </button>
                    <button type="button" className={styles.addPhotoButton} onClick={openNewReview}>
                      {t.addReview}
                    </button>
                  </div>
                )}
              </div>

              {adminMode && (
                <p className={styles.reviewsAdminStatus}>
                  {reviewsEnabled ? t.reviewsOn : t.reviewsOff}
                </p>
              )}
            </div>

            {reviews.length > 0 ? (
              <div
                className={`${styles.reviewsViewport} ${reviews.length <= 3 ? styles.reviewsViewportStatic : ""} ${adminMode ? styles.reviewsViewportManual : ""}`}
              >
                <div
                  className={`${styles.reviewsTrack} ${reviews.length > 3 && !adminMode ? styles.reviewsTrackAnimated : ""} ${reviews.length <= 3 ? styles.reviewsTrackStatic : ""}`}
                >
                  {[0, ...(reviews.length > 3 && !adminMode ? [1] : [])].map((copyIndex) => (
                    <div
                      className={`${styles.reviewsSet} ${reviews.length <= 3 ? styles.reviewsSetStatic : ""} ${reviews.length === 1 ? styles.reviewsCount1 : ""} ${reviews.length === 2 ? styles.reviewsCount2 : ""} ${reviews.length === 3 ? styles.reviewsCount3 : ""}`}
                      key={copyIndex}
                      aria-hidden={copyIndex === 1 ? true : undefined}
                    >
                      {reviews.map((review) => {
                        const quote = review.quote_original;
                        const role = getReviewServiceLabel(review.role_original, language);
                        const imageUrl = review.photo_path
                          ? supabase.storage.from("portfolio").getPublicUrl(review.photo_path).data.publicUrl
                          : null;

                        return (
                          <article className={styles.reviewItem} key={`${copyIndex}-${review.id}`}>
                            <blockquote className={styles.reviewQuote}>“{quote}”</blockquote>
                            <div className={styles.reviewPerson}>
                              {imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt="" className={styles.reviewAvatar} />
                              )}
                              <div className={styles.reviewPersonText}>
                                <strong>{review.name}</strong>
                                {role && <span>{role}</span>}
                              </div>
                            </div>
                            {adminMode && copyIndex === 0 && (
                              <button type="button" className={styles.reviewEditButton} onClick={() => openReviewEditor(review)}>
                                {t.editReview}
                              </button>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              adminMode && <div className={styles.container}><p className={styles.adminEmptyPortfolio}>{t.noReviews}</p></div>
            )}
          </section>
        )}

        <section id="offerte" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.contactHeadingWrap}>
              {adminMode && (
                <button type="button" className={styles.sectionEditButton} onClick={() => openTextEditor("contact")}>
                  {t.editTexts}
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
                <label className={styles.label} htmlFor="naam">{t.name}</label>
                <input id="naam" name="naam" type="text" required autoComplete="name" className={styles.input} value={naam} onChange={(e) => setNaam(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">{t.email}</label>
                <input id="email" name="email" type="email" required autoComplete="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefoon">{t.phoneOptional}</label>
                <input id="telefoon" name="telefoon" type="tel" autoComplete="tel" className={styles.input} value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="dienst">{t.desiredService}</label>
                <select id="dienst" name="dienst" required className={styles.input} value={dienst} onChange={(e) => setDienst(e.target.value)}>
                  <option value="">{t.chooseService}</option>
                  <option value="Belangrijke momenten">{t.serviceMoments}</option>
                  <option value="Portretfotografie">{t.servicePortrait}</option>
                  <option value="Fotografieworkshops en lessen">{t.serviceWorkshop}</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="bericht">{t.requestLabel}</label>
                <textarea
                  id="bericht"
                  name="bericht"
                  className={styles.textarea}
                  maxLength={400}
                  placeholder={t.requestPlaceholder}
                  value={bericht}
                  onChange={(e) => setBericht(e.target.value)}
                />
                <span className={styles.charCount}>{bericht.length}/400</span>
              </div>

              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitBtn} disabled={status === "loading"}>
                  {status === "loading" ? t.sending : t.sendRequest}
                </button>

                {status === "success" && (
                  <p className={`${styles.statusMsg} ${styles.statusSuccess}`}>
                    {t.success}
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
            <div className={styles.footerSocials} aria-label={t.socialMedia}>
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
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={TEXT_SECTIONS[textEditor].title[language]}>
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>{t.textEdit}</p>
                <h2>{TEXT_SECTIONS[textEditor].title[language]}</h2>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => setTextEditor(null)} aria-label={t.close}>×</button>
            </div>

            <div className={styles.adminModalFields}>
              {TEXT_SECTIONS[textEditor].fields.map((field) => (
                <label key={field.key} className={styles.adminField}>
                  <span>{field.label[language]}</span>
                  <textarea
                    rows={field.rows ?? 2}
                    value={textDraft[field.key] ?? ""}
                    onChange={(e) => setTextDraft((current) => ({ ...current, [field.key]: e.target.value }))}
                  />
                </label>
              ))}
            </div>

            <div className={styles.adminModalFooter}>
              <button type="button" className={styles.adminSecondaryButton} onClick={() => setTextEditor(null)}>{t.cancel}</button>
              <button type="button" className={styles.adminPrimaryButton} onClick={() => void saveTextSection()} disabled={savingText}>
                {savingText ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminMode && uploadCategory && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={t.photosAdd}>
          <div className={`${styles.adminModal} ${styles.adminModalWide}`}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>Portfolio</p>
                <h2>{t.photosAdd}</h2>
                <p className={styles.adminModalSubtext}>
                  {CATEGORIES.find((item) => item.value === uploadCategory)?.label[language]}
                </p>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => !uploading && setUploadCategory(null)} aria-label={t.close}>×</button>
            </div>

            <label className={styles.adminFilePicker}>
              <span>{t.selectPhotos}</span>
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
                        placeholder={`${t.dutch}: ${t.titleOptional}`}
                        value={draft.title}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, title: e.target.value } : item))}
                      />
                      <textarea
                        rows={2}
                        placeholder={`${t.dutch}: ${t.altOptional}`}
                        value={draft.altText}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, altText: e.target.value } : item))}
                      />
                      <input
                        type="text"
                        placeholder={`${t.english}: ${t.titleOptional}`}
                        value={draft.titleEn}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, titleEn: e.target.value } : item))}
                      />
                      <textarea
                        rows={2}
                        placeholder={`${t.english}: ${t.altOptional}`}
                        value={draft.altTextEn}
                        onChange={(e) => setUploadDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, altTextEn: e.target.value } : item))}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.removeDraftButton}
                      onClick={() => setUploadDrafts((current) => current.filter((item) => item.id !== draft.id))}
                      disabled={uploading}
                    >
                      {t.delete}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={styles.adminCheckbox}>
              <input type="checkbox" checked={publishUploads} onChange={(e) => setPublishUploads(e.target.checked)} disabled={uploading} />
              {t.publishDirect}
            </label>

            {uploadProgress && <p className={styles.uploadProgress}>{uploadProgress}</p>}

            <div className={styles.adminModalFooter}>
              <button type="button" className={styles.adminSecondaryButton} onClick={() => setUploadCategory(null)} disabled={uploading}>{t.cancel}</button>
              <button type="button" className={styles.adminPrimaryButton} onClick={() => void uploadPhotos()} disabled={uploading || uploadDrafts.length === 0}>
                {uploading ? t.uploading : `${uploadDrafts.length || ""} ${language === "nl" ? (uploadDrafts.length === 1 ? "foto" : "foto's") : (uploadDrafts.length === 1 ? "photo" : "photos")} ${t.upload}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminMode && editingPhoto && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={t.photoChange}>
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>Portfolio</p>
                <h2>{t.photoChange}</h2>
              </div>
              <button type="button" className={styles.adminModalClose} onClick={() => setEditingPhoto(null)} aria-label={t.close}>×</button>
            </div>

            <div className={styles.adminModalFields}>
              <label className={styles.adminField}>
                <span>{t.dutch}: {t.photoTitle}</span>
                <input type="text" value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} />
              </label>
              <label className={styles.adminField}>
                <span>{t.dutch}: {t.altText}</span>
                <textarea rows={3} value={photoAlt} onChange={(e) => setPhotoAlt(e.target.value)} />
              </label>
              <label className={styles.adminField}>
                <span>{t.english}: {t.photoTitle}</span>
                <input type="text" value={photoTitleEn} onChange={(e) => setPhotoTitleEn(e.target.value)} />
              </label>
              <label className={styles.adminField}>
                <span>{t.english}: {t.altText}</span>
                <textarea rows={3} value={photoAltEn} onChange={(e) => setPhotoAltEn(e.target.value)} />
              </label>
              <label className={styles.adminCheckbox}>
                <input type="checkbox" checked={photoPublished} onChange={(e) => setPhotoPublished(e.target.checked)} />
                {t.published}
              </label>
            </div>

            <div className={styles.adminModalFooterBetween}>
              <button type="button" className={styles.adminDangerButton} onClick={() => void deletePhoto(editingPhoto)} disabled={savingPhoto}>{t.photoDelete}</button>
              <div className={styles.adminModalFooterActions}>
                <button type="button" className={styles.adminSecondaryButton} onClick={() => setEditingPhoto(null)}>{t.cancel}</button>
                <button type="button" className={styles.adminPrimaryButton} onClick={() => void savePhoto()} disabled={savingPhoto}>
                  {savingPhoto ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminMode && reviewEditorOpen && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={editingReview ? t.editReview : t.addReview}>
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>{t.reviewsEyebrow}</p>
                <h2>{editingReview ? t.editReview : t.addReview.replace("+ ", "")}</h2>
              </div>
              <button
                type="button"
                className={styles.adminModalClose}
                onClick={() => !savingReview && setReviewEditorOpen(false)}
                aria-label={t.close}
              >
                ×
              </button>
            </div>

            <div className={styles.adminModalFields}>
              <label className={styles.adminField}>
                <span>{t.reviewQuote}</span>
                <textarea
                  rows={5}
                  maxLength={250}
                  value={reviewQuote}
                  onChange={(event) => setReviewQuote(event.target.value)}
                  disabled={savingReview}
                />
                <small className={styles.reviewCharCount}>{reviewQuote.length}/250</small>
              </label>

              <label className={styles.adminField}>
                <span>{t.name}</span>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(event) => setReviewName(event.target.value)}
                  disabled={savingReview}
                />
              </label>

              <label className={styles.adminField}>
                <span>{t.reviewRole}</span>
                <select
                  value={reviewRole}
                  onChange={(event) => setReviewRole(event.target.value)}
                  disabled={savingReview}
                >
                  <option value="">{t.reviewServicePlaceholder}</option>
                  {REVIEW_SERVICES.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label[language]}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.adminFilePicker}>
                <span>{t.reviewPhoto}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setReviewPhotoFile(event.target.files?.[0] ?? null);
                    setRemoveReviewPhoto(false);
                  }}
                  disabled={savingReview}
                />
              </label>

              {(reviewPhotoFile || editingReview?.photo_path) && !removeReviewPhoto && (
                <div className={styles.reviewAdminPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      reviewPhotoFile
                        ? URL.createObjectURL(reviewPhotoFile)
                        : supabase.storage.from("portfolio").getPublicUrl(editingReview!.photo_path!).data.publicUrl
                    }
                    alt=""
                  />
                </div>
              )}

              {editingReview?.photo_path && !reviewPhotoFile && (
                <label className={styles.adminCheckbox}>
                  <input
                    type="checkbox"
                    checked={removeReviewPhoto}
                    onChange={(event) => setRemoveReviewPhoto(event.target.checked)}
                    disabled={savingReview}
                  />
                  {t.removeCurrentPhoto}
                </label>
              )}
            </div>

            <div className={styles.adminModalFooterBetween}>
              {editingReview ? (
                <button type="button" className={styles.adminDangerButton} onClick={() => void deleteReview(editingReview)} disabled={savingReview}>
                  {t.reviewDelete}
                </button>
              ) : <span />}

              <div className={styles.adminModalFooterActions}>
                <button type="button" className={styles.adminSecondaryButton} onClick={() => setReviewEditorOpen(false)} disabled={savingReview}>
                  {t.cancel}
                </button>
                <button type="button" className={styles.adminPrimaryButton} onClick={() => void saveReview()} disabled={savingReview}>
                  {savingReview ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminMode && aboutImageEditorOpen && (
        <div className={styles.adminModalBackdrop} role="dialog" aria-modal="true" aria-label={t.aboutPhoto}>
          <div className={styles.adminModal}>
            <div className={styles.adminModalHead}>
              <div>
                <p className={styles.adminModalEyebrow}>{t.aboutPhoto}</p>
                <h2>{t.replacePhoto}</h2>
              </div>
              <button
                type="button"
                className={styles.adminModalClose}
                onClick={() => !savingAboutImage && setAboutImageEditorOpen(false)}
                aria-label={t.close}
              >
                ×
              </button>
            </div>

            <label className={styles.adminFilePicker}>
              <span>{t.chooseReplacement}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setAboutImageFile(event.target.files?.[0] ?? null)}
                disabled={savingAboutImage}
              />
            </label>

            {aboutImageFile && (
              <div className={styles.aboutImageAdminPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(aboutImageFile)} alt="" />
              </div>
            )}

            <div className={styles.adminModalFooter}>
              <button
                type="button"
                className={styles.adminSecondaryButton}
                onClick={() => setAboutImageEditorOpen(false)}
                disabled={savingAboutImage}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className={styles.adminPrimaryButton}
                onClick={() => void saveAboutImage()}
                disabled={savingAboutImage || !aboutImageFile}
              >
                {savingAboutImage ? t.uploading : t.replacePhoto}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxPhoto && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={t.viewPhoto}
          onClick={closeLightbox}
        >
          <div className={styles.lightboxShell} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label={t.close}
            >
              ×
            </button>

            <div
              className={styles.lightboxStage}
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
              onTouchCancel={() => { lightboxTouchStart.current = null; }}
            >
              {lightboxPhotos.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
                  onClick={() => showLightboxPhoto(-1)}
                  aria-label={t.previousPhoto}
                >
                  ‹
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={supabase.storage.from("portfolio").getPublicUrl(lightboxPhoto.storage_path).data.publicUrl}
                alt={
                  (language === "en" ? lightboxPhoto.alt_text_en : lightboxPhoto.alt_text) ||
                  (language === "en" ? lightboxPhoto.title_en : lightboxPhoto.title) ||
                  t.portfolioAlt
                }
                className={styles.lightboxImage}
              />

              <div className={styles.lightboxMeta}>
                <div className={styles.lightboxMetaText}>
                  <p className={styles.lightboxCategory}>
                    {CATEGORIES.find((category) => category.value === lightboxPhoto.category)?.label[language] ?? lightboxPhoto.category}
                  </p>
                  {(language === "en" ? lightboxPhoto.title_en : lightboxPhoto.title) && (
                    <h3 className={styles.lightboxTitle}>
                      {language === "en" ? lightboxPhoto.title_en : lightboxPhoto.title}
                    </h3>
                  )}
                  {(language === "en" ? lightboxPhoto.alt_text_en : lightboxPhoto.alt_text) && (
                    <p className={styles.lightboxAlt}>
                      {language === "en" ? lightboxPhoto.alt_text_en : lightboxPhoto.alt_text}
                    </p>
                  )}
                </div>

                {lightboxPhotos.length > 1 && (
                  <span className={styles.lightboxCounter}>
                    {lightboxIndex + 1} / {lightboxPhotos.length}
                  </span>
                )}
              </div>

              {lightboxPhotos.length > 1 && (
                <button
                  type="button"
                  className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
                  onClick={() => showLightboxPhoto(1)}
                  aria-label={t.nextPhoto}
                >
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {adminLoginModal}
    </div>
  );
}
