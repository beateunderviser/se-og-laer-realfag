# Se og lær realfag

Nettside som samler kjemivideoene fra YouTube-kanalen *Se og lær realfag*, sortert etter kurs og tema.

Hver video får sin egen side med egen adresse, tittel, beskrivelse og videomerking for Google. Elevene kan søke, krysse av videoer de har sett og bruke eksamensmodus.

## Slik legger du til eller endrer videoer

Alt innhold ligger i regnearket. Hver rad er én video:

| Kolonne | Hva du skriver | Eksempel |
|---|---|---|
| kurs | Kurset | Kjemi 1 |
| tema | Temaet, skrevet nøyaktig som i listen under | Støkiometri |
| rekkefolge | Plassen i temaet (1, 2, 3 …) | 3 |
| tittel | Kort tittel slik den skal stå på siden | Massetetthet |
| youtube | Lenken til videoen | https://www.youtube.com/watch?v=… |
| beskrivelse | To–tre setninger om hva videoen forklarer. Vises på siden og i Google. | |
| tidsstempler | Tid og tekst, skilt med semikolon | 0:00 Intro; 4:32 Eksempel med NaOH |
| eksamensrelevant | Skriv «ja» for å merke videoen som eksamensviktig | ja |
| oppgaver | Lenke til oppgaver/fasit (valgfritt) | |
| publisert | Datoen videoen ble lagt ut, som ÅÅÅÅ-MM-DD. Google trenger denne for å vise videoen med bilde i søket. | 2024-09-15 |
| stikkord | Ord elevene kan søke på | mol, stoffmengde |

Temaer i Kjemi 1: Atomer og periodesystemet, Sterke og svake bindinger, Kjemiske reaksjoner, Støkiometri, Termokjemi, Likevekter, Syrer og baser, Organisk kjemi, Miljøanalyse.

Nye temaer og Kjemi 2-temaer legges til i `config.mjs`.

Når du er ferdig med endringene, oppdaterer du siden slik: gå til Netlify → **Deploys** → **Trigger deploy** → **Deploy site**. Etter et halvt minutt er endringene ute på siden.

## Oppsett (gjøres én gang)

### 1. Google Regneark

1. Gå til [sheets.google.com](https://sheets.google.com) og lag et nytt, tomt regneark.
2. **Fil → Importer → Last opp** og velg `data/videoer.csv`. Velg «Erstatt regneark».
3. Trykk **Del** og sett tilgangen til **Alle med linken** kan **se**.
4. Lenken til regnearket står i `netlify.toml` (`SHEET_CSV_URL`). Videoene leses fra den første fanen i arket.

### 2. GitHub

Koden ligger i et GitHub-repo. Netlify henter koden derfra og bygger siden.

### 3. Netlify

1. **Add new site → Import an existing project → GitHub**, og velg repoet.
2. Innstillingene leses fra `netlify.toml`, så du trenger ikke å endre noe. Trykk **Deploy**.
3. Siden henter videoene fra regnearket hver gang den bygges.

### 4. Google Search Console

1. Gå til [search.google.com/search-console](https://search.google.com/search-console) og legg til adressen til siden.
2. Bekreft eierskapet (enklest via DNS når du har eget domene, eller med HTML-fil).
3. Under **Nettstedskart**, send inn `sitemap.xml`.

### 5. Eget domene (senere)

Kjøp domenet, for eksempel hos Domeneshop. I Netlify går du til **Domain management → Add a domain** og følger instruksjonene. Sideadressene i Google oppdateres automatisk ved neste bygging.

## Teknisk

- `build.mjs` leser regnearket (eller `data/videoer.csv` hvis `SHEET_CSV_URL` ikke er satt) og lager ferdige HTML-sider i `dist/`. Ingen pakker må installeres.
- `src/` inneholder stil, JavaScript og ikon.
- Bygg lokalt: `node build.mjs`, og åpne `dist/` med en enkel webserver.

## Formler i huskelapper og quiz

Formler skrives med LaTeX, et vanlig språk for matematikk:

- I huskelappen er kolonnen **innhold** for typen «formel» alltid en formel. Skriv den uten dollartegn.
- Andre steder (begreper, tips, forklaringer og quiz) skriver du formler mellom to dollartegn: `$c = \frac{n}{V}$`.

| Det du vil ha | Skriv |
|---|---|
| Brøk | `\frac{m}{M}` |
| Senket skrift | `c_1`, `N_A` |
| Hevet skrift | `r^2`, `10^{23}` |
| Gangetegn (prikk) | `\cdot` |
| Delta, sum, rho | `\Delta H`, `\sum`, `\rho` |
| Likevektspil | `\rightleftharpoons` |
| Vanlig tekst inni formel | `\text{mol}` |
| Desimalkomma | `6{,}022` |

Hvis en formel er skrevet feil, står det en advarsel i byggeloggen i Netlify, og formelen vises som ren tekst.
