// Bygger nettsiden til mappen dist/.
// Videoene hentes fra Google Regneark (SHEET_CSV_URL) eller fra data/videoer.csv.
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { SITE, KURS, IKONER } from "./config.mjs";

const OUT = "dist";

// ---------- Hjelpefunksjoner ----------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const slugify = (s) =>
  s.toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const norm = (s = "") => s.trim().toLowerCase().replace(/\s+/g, " ");

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => norm(h).replace(/ø/g, "o").replace(/[^a-z]/g, ""));
  return rows
    .filter((r) => r.some((x) => x.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
}

const youtubeId = (s) => {
  const m = s.match(/(?:v=|youtu\.be\/|\/video\/|\/embed\/|\/shorts\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(s) ? s : null;
};

const sekunder = (t) => t.split(":").map(Number).reduce((a, b) => a * 60 + b, 0);
const tidstekst = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`;
};
function parseStempler(s) {
  return s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = x.match(/^(\d{1,2}(?::\d{1,2}){1,2})\s*[-–:]?\s*(.+)$/);
    return m ? { s: sekunder(m[1]), tekst: m[2] } : null;
  }).filter(Boolean);
}

const ja = (s) => /^(ja|x|yes|j|1|true)$/i.test(s.trim());

const ikon = (navn, cls = "ico") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKONER[navn] || ""}</svg>`;

const kort = (s, n = 155) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + " …");

// ---------- Hent data ----------
async function hentCSV() {
  const url = process.env.SHEET_CSV_URL;
  if (url) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const tekst = await res.text();
      if (!/tittel/i.test(tekst.split("\n")[0])) throw new Error("fant ikke kolonnen «tittel» i første rad");
      console.log("Hentet videoer fra Google Regneark.");
      return tekst;
    } catch (e) {
      throw new Error(`Klarte ikke å hente regnearket (${e.message}). Sjekk at SHEET_CSV_URL er riktig og at arket er publisert som CSV.`);
    }
  }
  console.log("SHEET_CSV_URL er ikke satt. Bruker data/videoer.csv.");
  return readFile("data/videoer.csv", "utf8");
}

function byggData(rader) {
  const advarsler = [];
  const kurs = KURS.map((k) => ({ ...k, temaer: k.temaer.map((t) => ({ ...t, videoer: [] })) }));
  rader.forEach((r, i) => {
    const linje = i + 2;
    const k = kurs.find((x) => norm(x.navn) === norm(r.kurs || "Kjemi 1"));
    if (!k) return advarsler.push(`Rad ${linje}: ukjent kurs «${r.kurs}»`);
    const t = k.temaer.find((x) => norm(x.navn) === norm(r.tema));
    if (!t) return advarsler.push(`Rad ${linje}: ukjent tema «${r.tema}» (legg det til i config.mjs)`);
    const id = youtubeId(r.youtube || "");
    if (!id) return advarsler.push(`Rad ${linje}: fant ingen YouTube-lenke`);
    if (!r.tittel) return advarsler.push(`Rad ${linje}: mangler tittel`);
    t.videoer.push({
      id, tittel: r.tittel, beskrivelse: r.beskrivelse || "",
      rekkefolge: parseFloat(r.rekkefolge) || 1000 + i,
      stempler: parseStempler(r.tidsstempler || ""),
      eksamen: ja(r.eksamensrelevant || ""),
      oppgaver: r.oppgaver || "", publisert: r.publisert || "",
      stikkord: r.stikkord || "",
    });
  });
  for (const k of kurs) for (const t of k.temaer) {
    t.videoer.sort((a, b) => a.rekkefolge - b.rekkefolge);
    const brukt = new Set();
    for (const v of t.videoer) {
      let s = slugify(v.tittel) || v.id, n = 2;
      while (brukt.has(s)) s = `${slugify(v.tittel)}-${n++}`;
      brukt.add(s);
      v.slug = s;
      v.sti = `/${k.slug}/${t.slug}/${s}/`;
    }
  }
  return { kurs, advarsler };
}

// ---------- Maler ----------
let CSS_V = "", JS_V = "";

function side({ tittel, beskrivelse, sti, innhold, jsonld = [], bilde, type = "website", aktiv = "" }) {
  const url = SITE.url + sti;
  const ld = jsonld.map((x) => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...x }).replace(/</g, "\\u003c")}</script>`).join("\n");
  const nav = (href, tekst, key) => `<a href="${href}"${aktiv === key ? ' aria-current="page" class="on"' : ""}>${tekst}</a>`;
  return `<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tittel)}</title>
<meta name="description" content="${esc(beskrivelse)}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="${esc(SITE.navn)}">
<meta property="og:locale" content="nb_NO">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(tittel)}">
<meta property="og:description" content="${esc(beskrivelse)}">
<meta property="og:url" content="${url}">
${bilde ? `<meta property="og:image" content="${bilde}">\n<meta name="twitter:card" content="summary_large_image">` : ""}
<meta name="theme-color" content="#0E5A73">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<link rel="stylesheet" href="/style.css?v=${CSS_V}">
${ld}
</head>
<body>
<a class="skip" href="#innhold">Hopp til innholdet</a>
<header class="topp">
  <div class="wrap bar">
    <a class="logo" href="/"><span class="logo-mark" aria-hidden="true">SL</span>${esc(SITE.navn)}</a>
    <nav aria-label="Hovedmeny">
      ${nav("/kjemi-1/", "Kjemi 1", "kjemi-1")}
      ${nav("/kjemi-2/", "Kjemi 2", "kjemi-2")}
      ${nav("/eksamen/", "Eksamensmodus", "eksamen")}
    </nav>
    <div class="sok" role="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="q" type="search" placeholder="Søk, f.eks. «entalpi» eller «mol»" autocomplete="off" aria-label="Søk i videoene">
      <div class="treff" id="treff" hidden></div>
    </div>
  </div>
</header>
<main id="innhold" class="wrap">
${innhold}
</main>
<footer class="bunn">
  <div class="wrap">
    <p><strong>${esc(SITE.navn)}</strong> · Gratis kjemivideoer for videregående skole.</p>
    <p><a href="${SITE.youtube}" rel="noopener">Følg kanalen på YouTube</a></p>
  </div>
</footer>
<script src="/app.js?v=${JS_V}" defer></script>
</body>
</html>`;
}

const smuler = (ledd) =>
  `<nav class="smuler" aria-label="Brødsmuler">${ledd.map(([t, h], i) => (i < ledd.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`)).join(" / ")}</nav>`;

const smulerLd = (ledd) => ({
  "@type": "BreadcrumbList",
  itemListElement: ledd.map(([t, h], i) => ({ "@type": "ListItem", position: i + 1, name: t, item: SITE.url + h })),
});

const fremdrift = (ids, tekst = true) =>
  `<div class="fremdrift" data-ids="${ids.join(",")}">${tekst ? `<div class="fremdrift-tekst"><span class="ant">0 av ${ids.length} sett</span><span class="pst">0 %</span></div>` : ""}<div class="linje"><i></i></div></div>`;

const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const settKnapp = (id) => `<button class="dot" type="button" data-sett="${id}" aria-pressed="false" aria-label="Marker som sett"></button>`;

// ---------- Sider ----------
function forside(data) {
  const kort = data.kurs.map((k) => {
    const ids = k.temaer.flatMap((t) => t.videoer.map((v) => v.id));
    if (!ids.length) {
      return `<div class="kurs-kort snart"><span class="eyebrow">Kurs</span><h2>${esc(k.navn)}</h2><p class="meta">Videoene kommer fortløpende.</p><a class="lenke" href="/${k.slug}/">Les mer</a></div>`;
    }
    const med = k.temaer.filter((t) => t.videoer.length).length;
    return `<a class="kurs-kort" href="/${k.slug}/">
      <span class="eyebrow">Kurs</span><h2>${esc(k.navn)}</h2>
      <div class="mini">${k.temaer.map((t) => `<span style="--c:${t.farge}" class="${t.videoer.length ? "" : "tom"}" title="${esc(t.navn)}">${ikon(t.ikon)}</span>`).join("")}</div>
      <p class="meta">${ids.length} videoer · ${med} av ${k.temaer.length} temaer</p>
      ${fremdrift(ids)}
    </a>`;
  }).join("");
  return side({
    tittel: `${SITE.navn} – kjemivideoer for Kjemi 1 og Kjemi 2`,
    beskrivelse: SITE.beskrivelse,
    sti: "/",
    jsonld: [{ "@type": "WebSite", name: SITE.navn, url: SITE.url + "/", inLanguage: "nb" },
             { "@type": "Organization", name: SITE.navn, url: SITE.url + "/", sameAs: [SITE.youtube] }],
    innhold: `<section class="hero">
      <span class="eyebrow">Gratis videoer · Videregående</span>
      <h1>Kjemi forklart steg for steg, sortert etter tema</h1>
      <p class="ingress">Finn videoen du trenger i Kjemi 1 og Kjemi 2, følg temaene i anbefalt rekkefølge og hold oversikt over hva du har sett. Bruk eksamensmodus når du skal repetere.</p>
    </section>
    <div class="kurs-rad">${kort}</div>
    <div class="fordeler">
      <div><h3>Sortert etter læreplanen</h3><p>Temaene følger kompetansemålene, og videoene ligger i den rekkefølgen de bygger på hverandre.</p></div>
      <div><h3>Kryss av det du har sett</h3><p>Fremdriften lagres i nettleseren din. Du trenger ingen konto.</p></div>
      <div><h3>Eksamensmodus</h3><p>Velg temaene du skal repetere og sett eksamensdato, så får du en plan.</p></div>
    </div>`,
  });
}

function kursside(k) {
  const ids = k.temaer.flatMap((t) => t.videoer.map((v) => v.id));
  const ledd = [["Forside", "/"], [k.navn, `/${k.slug}/`]];
  if (!ids.length) {
    return side({
      tittel: `${k.navn} – videoer | ${SITE.navn}`, beskrivelse: k.beskrivelse, sti: `/${k.slug}/`, aktiv: k.slug,
      jsonld: [smulerLd(ledd)],
      innhold: `${smuler(ledd)}<div class="seksjon-topp"><div><span class="eyebrow">Kurs</span><h1>${esc(k.navn)}</h1></div></div>
      <p class="ingress">Videoene til ${esc(k.navn)} kommer etter hvert. De vil ligge her, sortert etter tema på samme måte som i Kjemi 1. <a href="${SITE.youtube}" rel="noopener">Følg kanalen på YouTube</a> for å få beskjed når nye videoer kommer.</p>`,
    });
  }
  const fliser = k.temaer.map((t, i) => {
    if (!t.videoer.length) return `<div class="flis tom" style="--c:${t.farge}"><span class="nr">${i + 1}</span>${ikon(t.ikon, "ico stor")}<span class="navn">${esc(t.navn)}</span><span class="ant">Kommer</span></div>`;
    const tids = t.videoer.map((v) => v.id);
    return `<a class="flis" style="--c:${t.farge}" href="/${k.slug}/${t.slug}/" data-ids="${tids.join(",")}"><span class="nr">${i + 1}</span><span class="ferdig">✓ Fullført</span>${ikon(t.ikon, "ico stor")}<span class="navn">${esc(t.navn)}</span><span class="ant">${t.videoer.length} videoer</span>${fremdrift(tids, false)}</a>`;
  }).join("");
  const alle = k.temaer.filter((t) => t.videoer.length).map((t) => `<section class="alle-gruppe" style="--c:${t.farge}">
      <h3><a href="/${k.slug}/${t.slug}/">${ikon(t.ikon)}${esc(t.navn)}</a></h3>
      <ol>${t.videoer.map((v) => `<li>${settKnapp(v.id)}<a href="${v.sti}">${esc(v.tittel)}</a></li>`).join("")}</ol>
    </section>`).join("");
  return side({
    tittel: `${k.navn} – alle videoer sortert etter tema | ${SITE.navn}`,
    beskrivelse: k.beskrivelse, sti: `/${k.slug}/`, aktiv: k.slug,
    jsonld: [smulerLd(ledd), {
      "@type": "Course", name: k.navn, description: k.beskrivelse, inLanguage: "nb",
      provider: { "@type": "Organization", name: SITE.navn, url: SITE.url + "/" },
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT10H" },
      offers: { "@type": "Offer", price: 0, priceCurrency: "NOK", category: "Free" },
    }],
    innhold: `${smuler(ledd)}
    <div class="seksjon-topp"><div><span class="eyebrow">Kurs</span><h1>${esc(k.navn)}</h1></div><div class="seksjon-fremdrift">${fremdrift(ids)}</div></div>
    <p class="ingress">${esc(k.beskrivelse)}</p>
    <div class="fliser">${fliser}</div>
    <h2 class="under">Alle videoer i ${esc(k.navn)}</h2>
    <div class="alle">${alle}</div>`,
  });
}

function temaside(k, t, nr) {
  const ledd = [["Forside", "/"], [k.navn, `/${k.slug}/`], [t.navn, `/${k.slug}/${t.slug}/`]];
  const sti = `/${k.slug}/${t.slug}/`;
  if (!t.videoer.length) {
    return side({
      tittel: `${t.navn} – ${k.navn} | ${SITE.navn}`, beskrivelse: `${t.beskrivelse} Videoer til ${k.navn}.`, sti, aktiv: k.slug,
      jsonld: [smulerLd(ledd)],
      innhold: `${smuler(ledd)}<div class="tema-topp" style="--c:${t.farge}"><div class="tema-ikon">${ikon(t.ikon)}</div><div><span class="eyebrow">Tema ${nr} · ${esc(k.navn)}</span><h1>${esc(t.navn)}</h1></div></div>
      <p class="ingress">${esc(t.beskrivelse)}</p><p class="ingress">Videoene til dette temaet kommer snart.</p>`,
    });
  }
  const ids = t.videoer.map((v) => v.id);
  const liste = t.videoer.map((v, i) => `<li class="vkort">
      <a class="vbilde" href="${v.sti}" tabindex="-1" aria-hidden="true"><img src="${thumb(v.id)}" alt="" loading="lazy" width="480" height="360"><span class="vnr">${i + 1}</span></a>
      <div class="vtekst">
        <h2><a href="${v.sti}">${esc(v.tittel)}</a></h2>
        ${v.beskrivelse ? `<p>${esc(v.beskrivelse)}</p>` : ""}
        ${v.eksamen ? `<span class="merke">Eksamensviktig</span>` : ""}
      </div>
      ${settKnapp(v.id)}
    </li>`).join("");
  return side({
    tittel: `${t.navn} – ${k.navn} – videoer | ${SITE.navn}`,
    beskrivelse: kort(`${t.navn} i ${k.navn}: ${t.videoer.length} videoer i anbefalt rekkefølge. ${t.beskrivelse}`),
    sti, aktiv: k.slug, bilde: thumb(t.videoer[0].id),
    jsonld: [smulerLd(ledd), {
      "@type": "ItemList", name: `${t.navn} – ${k.navn}`,
      itemListElement: t.videoer.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: SITE.url + v.sti, name: v.tittel })),
    }],
    innhold: `${smuler(ledd)}
    <div class="tema-topp" style="--c:${t.farge}"><div class="tema-ikon">${ikon(t.ikon)}</div><div><span class="eyebrow">Tema ${nr} · ${esc(k.navn)} · ${t.videoer.length} videoer</span><h1>${esc(t.navn)}</h1></div></div>
    <div class="tema-intro"><p class="ingress">${esc(t.beskrivelse)}</p><div class="tema-fremdrift">${fremdrift(ids)}</div></div>
    <ol class="vliste" style="--c:${t.farge}">${liste}</ol>
    <p class="start-her"><a class="knapp primar" href="${t.videoer[0].sti}">Start med første video →</a></p>`,
  });
}

function videoside(k, t, v, i) {
  const ledd = [["Forside", "/"], [k.navn, `/${k.slug}/`], [t.navn, `/${k.slug}/${t.slug}/`], [v.tittel, v.sti]];
  const forrige = t.videoer[i - 1], neste = t.videoer[i + 1];
  const watch = `https://www.youtube.com/watch?v=${v.id}`;
  const desc = v.beskrivelse || `${v.tittel} – video ${i + 1} av ${t.videoer.length} i temaet ${t.navn}, ${k.navn}.`;
  const videoLd = {
    "@type": "VideoObject", name: `${v.tittel} – ${t.navn} – ${k.navn}`, description: desc,
    thumbnailUrl: [thumb(v.id)], embedUrl: `https://www.youtube.com/embed/${v.id}`, url: SITE.url + v.sti,
    inLanguage: "nb", isFamilyFriendly: true, educationalLevel: "Videregående skole",
    learningResourceType: "Video", about: [t.navn, k.navn, "Kjemi"],
    publisher: { "@type": "Organization", name: SITE.navn, url: SITE.url + "/" },
  };
  if (v.publisert) videoLd.uploadDate = v.publisert;
  if (v.stempler.length) {
    videoLd.hasPart = v.stempler.map((s, j) => ({
      "@type": "Clip", name: s.tekst, startOffset: s.s,
      ...(v.stempler[j + 1] ? { endOffset: v.stempler[j + 1].s } : {}),
      url: `${watch}&t=${s.s}s`,
    }));
  }
  const stempler = v.stempler.length
    ? `<ul class="stempler">${v.stempler.map((s) => `<li><a href="${watch}&t=${s.s}s" data-t="${s.s}"><code>${tidstekst(s.s)}</code>${esc(s.tekst)}</a></li>`).join("")}</ul>`
    : "";
  return side({
    tittel: `${v.tittel} – ${t.navn} – ${k.navn} | ${SITE.navn}`,
    beskrivelse: kort(desc), sti: v.sti, aktiv: k.slug, bilde: thumb(v.id), type: "video.other",
    jsonld: [smulerLd(ledd), videoLd],
    innhold: `${smuler(ledd)}
    <div class="video-side" style="--c:${t.farge}">
      <article class="spiller">
        <div class="skjerm" data-yt="${v.id}">
          <img src="${thumb(v.id)}" alt="" width="480" height="360">
          <button class="spill" type="button" aria-label="Spill av ${esc(v.tittel)}"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg></button>
        </div>
        <div class="spiller-tekst">
          <span class="eyebrow">${esc(t.navn)} · Video ${i + 1} av ${t.videoer.length}</span>
          <div class="spiller-topp">
            <h1>${esc(v.tittel)}</h1>
            <button class="sett-knapp" type="button" data-sett="${v.id}" aria-pressed="false"><span class="dot-ikon"></span><span class="tekst">Marker som sett</span></button>
          </div>
          ${v.beskrivelse ? `<p class="beskr">${esc(v.beskrivelse)}</p>` : ""}
          ${v.eksamen ? `<p><span class="merke">Eksamensviktig</span></p>` : ""}
          ${stempler ? `<section class="blokk"><h2>Innhold i videoen</h2>${stempler}</section>` : ""}
          ${v.oppgaver ? `<section class="blokk"><h2>Oppgaver</h2><a class="oppgave" href="${esc(v.oppgaver)}" rel="noopener">Åpne oppgaver til denne videoen</a></section>` : ""}
          <div class="navrad">
            ${forrige ? `<a class="knapp" href="${forrige.sti}" rel="prev">← Forrige</a>` : `<span></span>`}
            ${neste ? `<a class="knapp primar" href="${neste.sti}" rel="next">Neste video →</a>` : `<a class="knapp primar" href="/${k.slug}/">Tilbake til ${esc(k.navn)}</a>`}
          </div>
          <p class="yt-lenke"><a href="${watch}" rel="noopener">Se videoen på YouTube</a></p>
        </div>
      </article>
      <aside class="sideliste" aria-label="Videoer i ${esc(t.navn)}">
        <div class="sideliste-topp"><a href="/${k.slug}/${t.slug}/"><strong>${esc(t.navn)}</strong></a>${fremdrift(t.videoer.map((x) => x.id))}</div>
        <ol>${t.videoer.map((x, j) => `<li class="${x.id === v.id ? "her" : ""}"><span class="n">${j + 1}</span><a href="${x.sti}"${x.id === v.id ? ' aria-current="page"' : ""}>${esc(x.tittel)}</a>${settKnapp(x.id)}</li>`).join("")}</ol>
      </aside>
    </div>`,
  });
}

function eksamensside(data) {
  const k = data.kurs.filter((x) => x.temaer.some((t) => t.videoer.length));
  const chips = k.map((kk) => `<div class="chip-gruppe"><h3>${esc(kk.navn)}</h3><div class="chips">${kk.temaer.map((t) =>
    `<button type="button" class="chip" style="--c:${t.farge}" data-tema="${kk.slug}/${t.slug}" aria-pressed="false" ${t.videoer.length ? "" : "disabled"}>${ikon(t.ikon)}${esc(t.navn)}</button>`).join("")}</div></div>`).join("");
  const grupper = k.flatMap((kk) => kk.temaer.filter((t) => t.videoer.length).map((t) => `<section class="gruppe" data-gruppe="${kk.slug}/${t.slug}" style="--c:${t.farge}" hidden>
      <h3><i></i>${esc(t.navn)} <small>${esc(kk.navn)}</small></h3>
      <ol>${t.videoer.map((v) => `<li data-id="${v.id}">${settKnapp(v.id)}<a href="${v.sti}">${esc(v.tittel)}</a>${v.eksamen ? '<span class="merke">Viktig</span>' : ""}</li>`).join("")}</ol>
    </section>`)).join("");
  return side({
    tittel: `Eksamensmodus – repeter til kjemieksamen | ${SITE.navn}`,
    beskrivelse: "Lag din egen repetisjonsplan til eksamen i Kjemi 1: velg temaer, sett eksamensdato og kryss av videoene etter hvert som du ser dem.",
    sti: "/eksamen/", aktiv: "eksamen",
    jsonld: [smulerLd([["Forside", "/"], ["Eksamensmodus", "/eksamen/"]])],
    innhold: `${smuler([["Forside", "/"], ["Eksamensmodus", "/eksamen/"]])}
    <div class="seksjon-topp"><div><span class="eyebrow">Repetisjon</span><h1>Eksamensmodus</h1></div></div>
    <p class="ingress">Velg temaene du skal repetere og når du har eksamen. Da får du en liste over videoene og en plan for hvor mange du bør se hver dag.</p>
    <div class="eksamen" id="eksamen">
      <div class="panel">
        <div><h2 class="steg">1. Velg temaer</h2>${chips}</div>
        <label class="felt" for="edato"><span class="steg">2. Når er eksamen?</span><input type="date" id="edato"></label>
        <div id="nedtelling"></div>
      </div>
      <div class="panel">
        <div><h2 class="steg">Din repetisjonsliste</h2><div id="eks-fremdrift"></div></div>
        <div id="eks-tom" class="tom-tekst">Velg ett eller flere temaer, så lages listen her.</div>
        ${grupper}
      </div>
    </div>`,
  });
}

function ikkeFunnet() {
  return side({
    tittel: `Fant ikke siden | ${SITE.navn}`, beskrivelse: "Siden finnes ikke.", sti: "/404.html",
    innhold: `<section class="hero"><span class="eyebrow">404</span><h1>Fant ikke siden</h1><p class="ingress">Siden kan ha blitt flyttet. Prøv søket øverst, eller gå til <a href="/kjemi-1/">Kjemi 1</a>.</p></section>`,
  });
}

// ---------- Bygg ----------
async function skriv(fil, innhold) {
  const p = path.join(OUT, fil);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, innhold);
}

const hash = (s) => createHash("md5").update(s).digest("hex").slice(0, 8);

async function main() {
  const { kurs, advarsler } = byggData(parseCSV(await hentCSV()));
  advarsler.forEach((a) => console.warn("Advarsel: " + a));
  const data = { kurs };

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const css = await readFile("src/style.css", "utf8");
  const js = await readFile("src/app.js", "utf8");
  CSS_V = hash(css); JS_V = hash(js);
  await skriv("style.css", css);
  await skriv("app.js", js);
  await cp("src/favicon.svg", path.join(OUT, "favicon.svg"));

  const sider = ["/"];
  await skriv("index.html", forside(data));
  for (const k of kurs) {
    await skriv(`${k.slug}/index.html`, kursside(k));
    sider.push(`/${k.slug}/`);
    for (const [ti, t] of k.temaer.entries()) {
      await skriv(`${k.slug}/${t.slug}/index.html`, temaside(k, t, ti + 1));
      sider.push(`/${k.slug}/${t.slug}/`);
      for (const [i, v] of t.videoer.entries()) {
        await skriv(`${k.slug}/${t.slug}/${v.slug}/index.html`, videoside(k, t, v, i));
        sider.push(v.sti);
      }
    }
  }
  await skriv("eksamen/index.html", eksamensside(data));
  sider.push("/eksamen/");
  await skriv("404.html", ikkeFunnet());

  // Søkeindeks for søkefeltet
  const indeks = kurs.flatMap((k) => k.temaer.flatMap((t) => t.videoer.map((v) => ({
    t: v.tittel, u: v.sti, k: k.navn, m: t.navn, f: t.farge, s: `${v.stikkord} ${v.beskrivelse}`,
  }))));
  await skriv("sok.json", JSON.stringify(indeks));

  // Nettstedskart og robots.txt
  const idag = new Date().toISOString().slice(0, 10);
  await skriv("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sider.map((s) => `  <url><loc>${SITE.url}${s}</loc><lastmod>${idag}</lastmod></url>`).join("\n")}
</urlset>
`);
  await skriv("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

  const antall = indeks.length;
  console.log(`Ferdig: ${antall} videoer, ${sider.length} sider i ${OUT}/`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
