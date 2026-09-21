"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

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

const CATEGORIES = [
  { value: "belangrijke-momenten", label: "Belangrijke momenten" },
  { value: "portretfotografie", label: "Portretfotografie" },
  { value: "workshops", label: "Workshops en fotografielessen" },
  { value: "mijn-werk", label: "Mijn werk" },
];

function categoryLabel(value: string) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const groupedPhotos = useMemo(() => {
    return CATEGORIES.map((categoryItem) => ({
      ...categoryItem,
      photos: photos.filter((photo) => photo.category === categoryItem.value),
    }));
  }, [photos]);

  async function verifyAdmin() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLoggedIn(false);
      return false;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      await supabase.auth.signOut();
      setLoggedIn(false);
      setError("Dit account heeft geen beheerrechten.");
      return false;
    }

    setLoggedIn(true);
    return true;
  }

  async function loadPhotos() {
    setLoadingPhotos(true);

    const { data, error: loadError } = await supabase
      .from("portfolio_photos")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(`Foto's konden niet worden geladen: ${loadError.message}`);
      setLoadingPhotos(false);
      return;
    }

    setPhotos(data ?? []);
    setLoadingPhotos(false);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      const ok = await verifyAdmin();

      if (ok && mounted) {
        await loadPhotos();
      }

      if (mounted) setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mailadres of wachtwoord is onjuist.");
      setLoading(false);
      return;
    }

    const ok = await verifyAdmin();

    if (ok) {
      setPassword("");
      await loadPhotos();
    }

    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoggedIn(false);
    setPhotos([]);
    setLoading(false);
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setError("Kies eerst een foto.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Gebruik alleen JPG, PNG of WebP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("De foto is groter dan 15 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const photosInCategory = photos.filter((photo) => photo.category === category);
    const nextSortOrder =
      photosInCategory.length === 0
        ? 0
        : Math.max(...photosInCategory.map((photo) => photo.sort_order)) + 1;

    const safeName = sanitizeFileName(file.name);
    const storagePath = `${category}/${crypto.randomUUID()}-${safeName}`;

    const { error: storageError } = await supabase.storage
      .from("portfolio")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (storageError) {
      setError(`Uploaden mislukt: ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("portfolio_photos")
      .insert({
        category,
        title: title.trim() || null,
        alt_text: altText.trim() || null,
        storage_path: storagePath,
        sort_order: nextSortOrder,
        is_published: isPublished,
      });

    if (insertError) {
      await supabase.storage.from("portfolio").remove([storagePath]);
      setError(`Foto kon niet worden opgeslagen: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setFile(null);
    setTitle("");
    setAltText("");
    setIsPublished(true);

    const input = document.getElementById("portfolio-file") as HTMLInputElement | null;
    if (input) input.value = "";

    setMessage("Foto is toegevoegd.");
    await loadPhotos();
    setUploading(false);
  }

  async function handleDelete(photo: PortfolioPhoto) {
    const confirmed = window.confirm(
      `Weet je zeker dat je deze foto uit "${categoryLabel(photo.category)}" wilt verwijderen?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: storageError } = await supabase.storage
      .from("portfolio")
      .remove([photo.storage_path]);

    if (storageError) {
      setError(`Bestand kon niet worden verwijderd: ${storageError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from("portfolio_photos")
      .delete()
      .eq("id", photo.id);

    if (deleteError) {
      setError(
        `Bestand is uit Storage verwijderd, maar de database kon niet worden bijgewerkt: ${deleteError.message}`
      );
      return;
    }

    setMessage("Foto is verwijderd.");
    await loadPhotos();
  }

  async function handlePublishedToggle(photo: PortfolioPhoto) {
    setError("");
    setMessage("");

    const nextValue = !photo.is_published;

    const { error: updateError } = await supabase
      .from("portfolio_photos")
      .update({ is_published: nextValue })
      .eq("id", photo.id);

    if (updateError) {
      setError(`Publicatiestatus kon niet worden aangepast: ${updateError.message}`);
      return;
    }

    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id ? { ...item, is_published: nextValue } : item
      )
    );
  }

  function publicUrl(storagePath: string) {
    return supabase.storage.from("portfolio").getPublicUrl(storagePath).data.publicUrl;
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Laden…</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className={styles.page}>
        <section className={styles.loginPanel}>
          <p className={styles.eyebrow}>Stahlecker Fotografie</p>
          <h1 className={styles.title}>Beheer</h1>
          <p className={styles.intro}>Log in om de website te beheren.</p>

          <form className={styles.form} onSubmit={handleLogin}>
            <label className={styles.label}>
              E-mailadres
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className={styles.label}>
              Wachtwoord
              <input
                className={styles.input}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.primaryButton} type="submit">
              Inloggen
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Stahlecker Fotografie</p>
            <h1 className={styles.title}>Portfolio beheer</h1>
            <p className={styles.intro}>
              Voeg foto's toe, zet ze online of offline en verwijder ze.
            </p>
          </div>

          <button className={styles.secondaryButton} type="button" onClick={handleLogout}>
            Uitloggen
          </button>
        </header>

        {error && <p className={styles.errorBanner}>{error}</p>}
        {message && <p className={styles.successBanner}>{message}</p>}

        <section className={styles.uploadPanel}>
          <h2 className={styles.sectionTitle}>Foto toevoegen</h2>

          <form className={styles.uploadForm} onSubmit={handleUpload}>
            <label className={styles.label}>
              Onderdeel
              <select
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Foto
              <input
                id="portfolio-file"
                className={styles.fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>

            <label className={styles.label}>
              Titel <span className={styles.optional}>(optioneel)</span>
              <input
                className={styles.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Alt-tekst <span className={styles.optional}>(optioneel)</span>
              <input
                className={styles.input}
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Korte beschrijving van de foto"
              />
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Meteen publiceren
            </label>

            <button className={styles.primaryButton} type="submit" disabled={uploading}>
              {uploading ? "Uploaden…" : "Foto uploaden"}
            </button>
          </form>
        </section>

        <section className={styles.portfolioSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Portfolio</h2>
            <span className={styles.counter}>{photos.length} foto&apos;s</span>
          </div>

          {loadingPhotos ? (
            <p className={styles.muted}>Foto&apos;s laden…</p>
          ) : (
            groupedPhotos.map((group) => (
              <div className={styles.categoryBlock} key={group.value}>
                <div className={styles.categoryHeader}>
                  <h3>{group.label}</h3>
                  <span>{group.photos.length}</span>
                </div>

                {group.photos.length === 0 ? (
                  <p className={styles.empty}>Nog geen foto&apos;s in dit onderdeel.</p>
                ) : (
                  <div className={styles.grid}>
                    {group.photos.map((photo) => (
                      <article className={styles.card} key={photo.id}>
                        <div className={styles.imageWrap}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={publicUrl(photo.storage_path)}
                            alt={photo.alt_text || photo.title || group.label}
                            className={styles.image}
                          />
                        </div>

                        <div className={styles.cardBody}>
                          <div>
                            <strong className={styles.cardTitle}>
                              {photo.title || "Zonder titel"}
                            </strong>
                            <p className={styles.cardMeta}>
                              {photo.is_published ? "Online" : "Verborgen"}
                            </p>
                          </div>

                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={styles.smallButton}
                              onClick={() => handlePublishedToggle(photo)}
                            >
                              {photo.is_published ? "Verbergen" : "Publiceren"}
                            </button>

                            <button
                              type="button"
                              className={styles.dangerButton}
                              onClick={() => handleDelete(photo)}
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
