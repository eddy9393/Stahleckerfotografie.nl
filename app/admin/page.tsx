"use client";

import { FormEvent, useEffect, useState } from "react";
import StahleckerSite from "@/components/StahleckerSite";
import { supabase } from "@/lib/supabase";
import styles from "./admin.module.css";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        if (mounted) {
          setLoggedIn(false);
          setLoading(false);
        }
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        if (mounted) {
          setLoggedIn(false);
          setError("Dit account heeft geen beheerrechten.");
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setLoggedIn(true);
        setLoading(false);
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mailadres of wachtwoord is onjuist.");
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      await supabase.auth.signOut();
      setError("Dit account heeft geen beheerrechten.");
      setLoading(false);
      return;
    }

    setPassword("");
    setLoggedIn(true);
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoggedIn(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Laden…</p>
      </main>
    );
  }

  if (loggedIn) {
    return <StahleckerSite adminMode onLogout={handleLogout} />;
  }

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
