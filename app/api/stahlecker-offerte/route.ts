import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Max 3 aanvragen per IP per 10 minuten
async function isRateLimited(ip: string): Promise<boolean> {
  const key = `ratelimit:stahlecker-offerte:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 10 * 60);
  return count > 3;
}

async function verstuurEmail(
  naam: string,
  email: string,
  telefoon: string,
  dienst: string,
  bericht: string
) {
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Ontvangstadres staat vast op het mailadres van de fotograaf.
  const ontvanger = "stahlecker.fotografie@outlook.com";

  await transporter.sendMail({
    from: `"Stahlecker Fotografie — website" <${process.env.MAIL_USER}>`,
    to: ontvanger,
    replyTo: email,
    subject: `Nieuwe offerteaanvraag van ${naam}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1a1a1a">Nieuwe offerteaanvraag</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-weight:600;width:140px">Naam</td><td>${naam}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600">E-mail</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${telefoon ? `<tr><td style="padding:8px 0;font-weight:600">Telefoon</td><td>${telefoon}</td></tr>` : ""}
          <tr><td style="padding:8px 0;font-weight:600">Gewenste dienst</td><td>${dienst}</td></tr>
          ${bericht ? `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top">Aanvraag</td><td style="white-space:pre-wrap">${bericht}</td></tr>` : ""}
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
        <p style="color:#999;font-size:12px">Verzonden via het offerteformulier op stahleckerfotografie.nl</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Te veel aanvragen. Probeer het over 10 minuten opnieuw." },
      { status: 429 }
    );
  }

  const { naam, email, telefoon, dienst, bericht } = await req.json();

  if (!naam?.trim() || !email?.trim() || !dienst?.trim()) {
    return NextResponse.json(
      { error: "Naam, e-mailadres en gewenste dienst zijn verplicht." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }
  if (bericht && bericht.length > 400) {
    return NextResponse.json({ error: "Bericht is te lang (max 400 tekens)." }, { status: 400 });
  }
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return NextResponse.json(
      { error: "Mailconfiguratie ontbreekt. Neem direct contact op via stahlecker.fotografie@outlook.com." },
      { status: 500 }
    );
  }

  try {
    await verstuurEmail(
      naam.trim(),
      email.trim(),
      telefoon?.trim() ?? "",
      dienst.trim(),
      bericht?.trim() ?? ""
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("E-mail versturen mislukt (stahlecker-offerte):", msg);
    return NextResponse.json({ error: "Versturen mislukt. Probeer het opnieuw." }, { status: 500 });
  }
}
