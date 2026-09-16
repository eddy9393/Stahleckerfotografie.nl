"use client";
import { useEffect, useRef, RefObject } from "react";

interface Options {
  threshold?: number;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: Options = {}
): RefObject<T> {
  const ref = useRef<T>(null);
  const { threshold = 0.15, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Staat het element al (deels) in beeld op het moment dat dit effect
    // draait — bijvoorbeeld omdat er via het menu naar deze sectie is
    // gesprongen, of de pagina is geladen met een #hash — laat 'm dan
    // meteen zien in plaats van eerst te verbergen. Anders lijkt het
    // alsof scrollen-naar-sectie niets doet.
    const rect = el.getBoundingClientRect();
    const staatAlInBeeld = rect.top < window.innerHeight && rect.bottom > 0;

    if (staatAlInBeeld) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    // Set initial state
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  return ref;
}
