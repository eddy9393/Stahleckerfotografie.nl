import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Privacyverklaring van Stahlecker Fotografie over contactaanvragen, klantgegevens en foto's.",
  alternates: {
    canonical: "/privacyverklaring",
  },
};

export default function PrivacyverklaringPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Terug naar Stahlecker Fotografie
        </Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>Stahlecker Fotografie</p>
          <h1>Privacyverklaring</h1>
          <p className={styles.updated}>Laatst bijgewerkt: 22 september 2026</p>
        </header>

        <section>
          <h2>1. Wie is verantwoordelijk?</h2>
          <p>
            Stahlecker Fotografie, gevestigd in Zoetermeer, is verantwoordelijk
            voor de verwerking van persoonsgegevens via deze website en bij
            fotografieopdrachten.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:info@stahleckerfotografie.nl">
              info@stahleckerfotografie.nl
            </a>{" "}
            · <a href="tel:+31644210858">06-44210858</a>
          </p>
          <p>
            Stahlecker Fotografie is op dit moment nog niet ingeschreven bij de
            Kamer van Koophandel. Een zakelijk adres voor juridische informatie
            is nog niet definitief bepaald.
          </p>
        </section>

        <section>
          <h2>2. Welke gegevens worden verwerkt?</h2>
          <p>
            Via het contactformulier kunnen naam, e-mailadres, telefoonnummer,
            de gewenste dienst en informatie over de aanvraag worden verwerkt.
            In het vrije bericht kan bijvoorbeeld een gewenste datum of periode
            en de locatie van de opdracht worden genoemd.
          </p>
        </section>

        <section>
          <h2>3. Waarvoor worden deze gegevens gebruikt?</h2>
          <p>
            De gegevens worden gebruikt om een aanvraag te beantwoorden,
            eventueel een offerte te maken, een afspraak te plannen en, wanneer
            daar een opdracht uit voortkomt, de fotografieopdracht uit te voeren
            en administratief af te handelen.
          </p>
        </section>

        <section>
          <h2>4. Bewaartermijnen</h2>
          <p>
            Contactaanvragen waar geen opdracht uit voortkomt worden maximaal
            één jaar bewaard.
          </p>
          <p>
            Bij een opdracht worden gewone contact- en projectgegevens niet
            langer bewaard dan nodig. Gegevens die onderdeel zijn van de
            financiële administratie worden bewaard zolang dit wettelijk nodig
            is; hiervoor wordt een termijn van zeven jaar aangehouden.
          </p>
        </section>

        <section>
          <h2>5. Foto&apos;s van klanten</h2>
          <p>
            Na oplevering worden klantfoto&apos;s in principe maximaal één jaar
            bewaard, bijvoorbeeld voor een nabestelling of wanneer een klant
            bestanden opnieuw nodig heeft.
          </p>
          <p>
            Herkenbare foto&apos;s van klanten worden alleen voor portfolio,
            website of social media gebruikt wanneer daarvoor toestemming is
            gegeven.
          </p>
        </section>

        <section>
          <h2>6. Externe diensten en opslag</h2>
          <p>
            Voor communicatie, planning en opslag kunnen Microsoft-diensten
            worden gebruikt, waaronder Outlook, Outlook Agenda, OneDrive en
            Microsoft Personal. Klantfoto&apos;s kunnen daarnaast op externe
            harde schijven worden bewaard.
          </p>
          <p>
            Het contactformulier wordt technisch verwerkt via de
            websitehosting en vervolgens per e-mail doorgestuurd naar
            Stahlecker Fotografie. Dienstverleners krijgen alleen toegang voor
            zover dit nodig is om hun technische dienst uit te voeren.
          </p>
        </section>

        <section>
          <h2>7. Beveiliging en spambeveiliging</h2>
          <p>
            Er worden passende technische maatregelen gebruikt om
            persoonsgegevens te beschermen. Het contactformulier bevat
            daarnaast automatische spamcontroles en een limiet op het aantal
            aanvragen dat kort na elkaar kan worden verstuurd.
          </p>
        </section>

        <section>
          <h2>8. Analytics en tracking</h2>
          <p>
            Op dit moment gebruikt deze website geen advertentietracking of
            uitgebreide bezoekersanalytics. Als dit in de toekomst verandert,
            wordt deze privacyverklaring waar nodig aangepast.
          </p>
        </section>

        <section>
          <h2>9. Jouw privacyrechten</h2>
          <p>
            Je kunt vragen welke persoonsgegevens over jou worden verwerkt en
            verzoeken om gegevens te corrigeren of, wanneer dat van toepassing
            is, te verwijderen. Je kunt ook bezwaar maken tegen een verwerking
            of vragen om beperking ervan.
          </p>
          <p>
            Een verzoek kan worden gestuurd naar{" "}
            <a href="mailto:info@stahleckerfotografie.nl">
              info@stahleckerfotografie.nl
            </a>
            .
          </p>
        </section>

        <section>
          <h2>10. Wijzigingen</h2>
          <p>
            Deze privacyverklaring kan worden aangepast wanneer de website,
            werkwijze of gebruikte diensten veranderen. De meest actuele versie
            staat altijd op deze pagina.
          </p>
        </section>
      </div>
    </main>
  );
}
