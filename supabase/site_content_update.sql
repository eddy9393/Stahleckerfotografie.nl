-- Stahlecker Fotografie - uitbreiding voor bewerkbare websiteteksten
-- Uitvoeren in Supabase > SQL Editor > New query > Run.
-- Dit script wijzigt de bestaande portfolio-opzet niet.

begin;

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;

-- De website mag alle opgeslagen teksten lezen.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

-- Alleen gebruikers die in public.admin_users staan mogen teksten beheren.
drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
on public.site_content
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
on public.site_content
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
on public.site_content
for delete
to authenticated
using (public.is_admin());

-- Huidige teksten als startwaarden. Bestaande waarden worden niet overschreven.
insert into public.site_content (key, value)
values
  ('hero_eyebrow', 'Stahlecker Fotografie'),
  ('hero_headline', 'Oprechte fotografie met aandacht voor mens en moment.'),
  ('hero_cta', 'Ontdek mijn werk'),
  ('portfolio_eyebrow', 'Portfolio'),
  ('portfolio_heading', 'Portretten'),
  ('workshop_eyebrow', 'Leren zien'),
  ('workshop_heading', 'Fotografieworkshop'),
  ('workshop_lead', 'Voor beginnende fotografen en mensen die hun camera beter willen leren begrijpen. De workshop kan individueel of in een kleine groep worden gegeven.'),
  ('workshop_body_1', 'Tijdens de workshop leer je de belangrijkste instellingen van je camera begrijpen en gebruiken, zoals sluitertijd, diafragma en ISO. Daarnaast besteden we aandacht aan compositie, licht en bewust leren kijken. Er is veel ruimte om praktisch te oefenen en vragen te stellen.'),
  ('workshop_body_2', 'De workshop duurt 1 à 2 uur en vindt plaats in Zoetermeer en omgeving. De precieze locatie kan afhankelijk zijn van het onderwerp en de wensen van de deelnemer. Neem je eigen camera mee, bij voorkeur een camera waarbij sluitertijd, diafragma en ISO handmatig kunnen worden ingesteld. Eigen objectieven en andere fotografieaccessoires kunnen natuurlijk ook mee.'),
  ('workshop_body_3', 'De workshop wordt rustig en stap voor stap opgebouwd. De nadruk ligt op zelf fotograferen en begrijpen waarom bepaalde instellingen of keuzes werken. De inhoud kan worden aangepast aan jouw niveau en leerwensen. De prijs is op aanvraag.'),
  ('about_eyebrow', 'Over mij'),
  ('about_heading', 'Jeroen Stahlecker'),
  ('about_p1', 'Mijn naam is Jeroen Stahlecker en fotografie is voor mij een manier om mensen, momenten en verhalen op een persoonlijke manier vast te leggen.'),
  ('about_p2', 'Wat mij vooral aanspreekt, zijn echte momenten. Een blik, een ontmoeting, een bijzonder moment of juist iets kleins dat gemakkelijk voorbijgaat. Ik probeer niet alleen te fotograferen wat er gebeurt, maar ook iets van de sfeer en de persoon achter het beeld te laten zien.'),
  ('about_p3', 'Mijn stijl is rustig, authentiek en persoonlijk. Tijdens het fotograferen vind ik het belangrijk dat mensen zich op hun gemak kunnen voelen. Ik neem de tijd, geef duidelijke aanwijzingen wanneer dat nodig is en probeer geen situatie te forceren. Juist wanneer iemand zichzelf kan zijn, ontstaan vaak de mooiste beelden.'),
  ('about_p4', 'Binnen Stahlecker Fotografie richt ik mij vooral op belangrijke momenten, portretfotografie en fotografieworkshops en lessen. Naast zelf fotograferen vind ik het ook leuk om mijn kennis over fotografie over te brengen. Ik leg dingen graag rustig en stap voor stap uit en vind het mooi wanneer iemand niet alleen leert hoe een camera werkt, maar ook anders leert kijken.'),
  ('about_p5', 'Met Stahlecker Fotografie bouw ik mijn fotografie stap voor stap verder uit. Daarbij wil ik vooral werk maken dat persoonlijk is en betekenis heeft voor de mensen die ik fotografeer.'),
  ('contact_eyebrow', 'Contact'),
  ('contact_heading', 'Vraag een offerte aan'),
  ('contact_intro', 'Wil je een belangrijk moment laten vastleggen, een portret laten maken of een fotografieworkshop volgen? Vul hieronder je voorkeuren in, dan neem ik contact met je op.'),
  ('placeholder_headline', 'De website is binnenkort helemaal klaar.'),
  ('placeholder_intro', 'Wil je nu al contact opnemen? Neem dan contact op via'),
  ('footer_brand', 'Stahlecker Fotografie')
on conflict (key) do nothing;

commit;
