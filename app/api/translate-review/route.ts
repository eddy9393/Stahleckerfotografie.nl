import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DeepLTranslation = {
  detected_source_language?: string;
  text: string;
};

async function verifyAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !publishableKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: "{}",
    cache: "no-store",
  });

  if (!response.ok) return false;
  return (await response.json()) === true;
}

async function translateTexts(texts: string[], targetLang: "NL" | "EN-GB") {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPL_API_KEY ontbreekt in Vercel.");
  }

  const configuredBaseUrl = process.env.DEEPL_API_URL?.replace(/\/$/, "");
  const baseUrls = configuredBaseUrl
    ? [configuredBaseUrl]
    : ["https://api-free.deepl.com", "https://api.deepl.com"];

  let lastError = "DeepL-vertaling is mislukt.";

  for (let index = 0; index < baseUrls.length; index += 1) {
    const baseUrl = baseUrls[index];
    const response = await fetch(`${baseUrl}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        target_lang: targetLang,
        preserve_formatting: true,
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      return (result.translations ?? []) as DeepLTranslation[];
    }

    lastError = typeof result?.message === "string" ? result.message : `DeepL gaf status ${response.status}.`;

    // Een API Free- en API Pro-key zijn niet op hetzelfde endpoint geldig.
    // Alleen bij een authorization-fout proberen we daarom het andere endpoint.
    if (configuredBaseUrl || response.status !== 403 || index === baseUrls.length - 1) {
      break;
    }
  }

  throw new Error(lastError);
}

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: "Geen beheerrechten." }, { status: 403 });
  }

  let body: { quote?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const quote = typeof body.quote === "string" ? body.quote.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";

  if (!quote || quote.length > 250) {
    return NextResponse.json({ error: "De review moet tussen 1 en 250 tekens bevatten." }, { status: 400 });
  }

  const texts = role ? [quote, role] : [quote];

  try {
    let enTranslations: DeepLTranslation[] | null = null;
    let nlTranslations: DeepLTranslation[] | null = null;

    try {
      enTranslations = await translateTexts(texts, "EN-GB");
    } catch {
      // Als de bron al Engels is, kan een provider dezelfde bron/doeltaal weigeren.
      // In dat geval vertalen we eerst naar Nederlands en gebruiken we de detectie daarvan.
      nlTranslations = await translateTexts(texts, "NL");
    }

    const sourceLanguage = (
      enTranslations?.[0]?.detected_source_language ||
      nlTranslations?.[0]?.detected_source_language ||
      ""
    ).toUpperCase();

    if (sourceLanguage === "NL" && enTranslations) {
      return NextResponse.json({
        source_language: sourceLanguage,
        quote_nl: quote,
        role_nl: role || null,
        quote_en: enTranslations[0]?.text || quote,
        role_en: role ? (enTranslations[1]?.text || role) : null,
      });
    }

    if (!nlTranslations) {
      nlTranslations = await translateTexts(texts, "NL");
    }

    if (sourceLanguage === "EN") {
      return NextResponse.json({
        source_language: sourceLanguage,
        quote_nl: nlTranslations[0]?.text || quote,
        role_nl: role ? (nlTranslations[1]?.text || role) : null,
        quote_en: quote,
        role_en: role || null,
      });
    }

    if (!enTranslations) {
      enTranslations = await translateTexts(texts, "EN-GB");
    }

    return NextResponse.json({
      source_language: sourceLanguage || null,
      quote_nl: nlTranslations[0]?.text || quote,
      role_nl: role ? (nlTranslations[1]?.text || role) : null,
      quote_en: enTranslations[0]?.text || quote,
      role_en: role ? (enTranslations[1]?.text || role) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vertalen is mislukt.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
