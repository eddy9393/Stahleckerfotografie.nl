import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const FORM_MINIMUM_MS = 2200;
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@stahleckerfotografie.nl";

const allowedServices = new Set([
  "Belangrijke momenten",
  "Portretfotografie",
  "Fotografieworkshops en lessen",
]);

type MemoryRate = {
  count: number;
  resetAt: number;
};

const memoryRateLimit = new Map<string, MemoryRate>();

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

async function isRateLimited(ip: string): Promise<boolean> {
  const redis = getRedis();

  if (redis) {
    const key = `ratelimit:stahlecker-offerte:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    return count > RATE_LIMIT_MAX;
  }

  const now = Date.now();
  const current = memoryRateLimit.get(ip);

  if (!current || current.resetAt <= now) {
    memoryRateLimit.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
    });
    return false;
  }

  current.count += 1;
  memoryRateLimit.set(ip, current);
  return current.count > RATE_LIMIT_MAX;
}

function clean(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function countLinks(value: string) {
  return (value.match(/(?:https?:\/\/|www\.)/gi) || []).length;
}

async function sendEmail({
  naam,
  email,
  telefoon,
  dienst,
  bericht,
}: {
  naam: string;
  email: string;
  telefoon: string;
  dienst: string;
  bericht: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY ontbreekt.");
  }

  const safeNaam = escapeHtml(naam);
  const safeEmail = escapeHtml(email);
  const safeTelefoon = escapeHtml(telefoon);
  const safeDienst = escapeHtml(dienst);
  const safeBericht = escapeHtml(bericht).replace(/\n/g, "<br>");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Stahlecker Fotografie <info@stahleckerfotografie.nl>",
      to: [TO_EMAIL],
      reply_to: email,
      subject: `Nieuwe fotografieaanvraag — ${dienst}`,
      text: [
        "Nieuwe fotografieaanvraag via stahleckerfotografie.nl",
        "",
        `Naam: ${naam}`,
        `E-mail: ${email}`,
        telefoon ? `Telefoon: ${telefoon}` : null,
        `Gewenste dienst: ${dienst}`,
        bericht ? `Aanvraag: ${bericht}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1c1c1c">
          <h2 style="margin:0 0 20px">Nieuwe fotografieaanvraag</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:700;width:155px">Naam</td><td>${safeNaam}</td></tr>
            <tr><td style="padding:8px 0;font-weight:700">E-mail</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            ${safeTelefoon ? `<tr><td style="padding:8px 0;font-weight:700">Telefoon</td><td>${safeTelefoon}</td></tr>` : ""}
            <tr><td style="padding:8px 0;font-weight:700">Gewenste dienst</td><td>${safeDienst}</td></tr>
            ${safeBericht ? `<tr><td style="padding:8px 0;font-weight:700;vertical-align:top">Aanvraag</td><td style="line-height:1.6">${safeBericht}</td></tr>` : ""}
          </table>
          <hr style="margin:24px 0;border:0;border-top:1px solid #ddd">
          <p style="margin:0;color:#777;font-size:12px">Verzonden via het contactformulier op stahleckerfotografie.nl</p>
        </div>
      `,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;

    try {
      const body = await response.text();
      if (body) detail = `${detail}: ${body.slice(0, 500)}`;
    } catch {
      // Alleen voor logging; de bezoeker krijgt geen technische details te zien.
    }

    throw new Error(`Resend versturen mislukt (${detail}).`);
  }
}
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const body = await req.json();

    // Honeypot: bots vullen verborgen velden vaak automatisch in.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const startedAt = Number(body.startedAt);
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < FORM_MINIMUM_MS) {
      return NextResponse.json(
        { error: "Formulier kon niet worden verzonden. Probeer het opnieuw." },
        { status: 400 }
      );
    }

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Te veel aanvragen. Probeer het over 10 minuten opnieuw." },
        { status: 429 }
      );
    }

    const naam = clean(body.naam, 100);
    const email = clean(body.email, 254).toLowerCase();
    const telefoon = clean(body.telefoon, 50);
    const dienst = clean(body.dienst, 80);
    const bericht = clean(body.bericht, 400);

    if (!naam || !email || !dienst) {
      return NextResponse.json(
        { error: "Naam, e-mailadres en gewenste dienst zijn verplicht." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
    }

    if (!allowedServices.has(dienst)) {
      return NextResponse.json({ error: "Kies een geldige dienst." }, { status: 400 });
    }

    if (countLinks(bericht) > 2) {
      return NextResponse.json(
        { error: "Je bericht bevat te veel links." },
        { status: 400 }
      );
    }

    await sendEmail({ naam, email, telefoon, dienst, bericht });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Contactformulier Stahlecker Fotografie:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      {
        error:
          "Versturen mislukt. Mail eventueel rechtstreeks naar info@stahleckerfotografie.nl.",
      },
      { status: 500 }
    );
  }
}
