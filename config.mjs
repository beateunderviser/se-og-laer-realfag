// Innstillinger for nettsiden. Endre tekster og temaer her.

export const SITE = {
  navn: "Se og lær realfag",
  // Netlify fyller inn URL automatisk. Når du kobler på eget domene, brukes det.
  url: (process.env.URL || "https://seoglaerrealfag.netlify.app").replace(/\/$/, ""),
  youtube: "https://www.youtube.com/channel/UCX_Ogk2LFSfLtohYEv6uc2A",
  beskrivelse:
    "Gratis videoer i kjemi for videregående skole, sortert etter tema. Lær og repeter til prøver og eksamen i Kjemi 1 og Kjemi 2.",
};

// Ikoner (enkle strektegninger, 24×24)
export const IKONER = {
  atom: '<circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  molekyl: '<circle cx="5.5" cy="16" r="3"/><circle cx="18.5" cy="16" r="3"/><circle cx="12" cy="5.5" r="2.5"/><path d="M8.5 16h7M7.2 13.4l3.4-5.6M16.8 13.4l-3.4-5.6"/>',
  kolbe: '<path d="M9 3h6M10 3v6l-5.4 9.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9V3"/><path d="M7.3 15.5h9.4"/><circle cx="11" cy="18.3" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="17.6" r=".7" fill="currentColor" stroke="none"/>',
  vekt: '<path d="M12 4v16M8 20h8M4.5 7h15"/><path d="M2 14l2.5-7 2.5 7M17 14l2.5-7 2.5 7"/><path d="M2 14a2.5 2.5 0 0 0 5 0zM17 14a2.5 2.5 0 0 0 5 0z"/>',
  flamme: '<path d="M12 2.5c1 3.2 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.6 1.4-4.3 2.6-5.3.3 2 1.3 3.1 2.4 3.4-.9-3.4-.5-6.2.5-8.6z"/>',
  likevekt: '<path d="M3.5 9h16l-4-4M20.5 15h-16l4 4"/>',
  draape: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.2 14.5a2.8 2.8 0 0 0 2.8 2.8"/>',
  benzen: '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/><circle cx="12" cy="12" r="4.2"/>',
  blad: '<path d="M4.5 19.5C4.5 11 9.5 4.5 20 4.5c0 10.5-6.5 15-15.5 15z"/><path d="M4.5 19.5c3-4.5 6.5-7.5 10.5-9.5"/>',
};

// Kursene og temaene. "navn" på temaet må være skrevet likt i regnearket.
export const KURS = [
  {
    slug: "kjemi-1",
    navn: "Kjemi 1",
    beskrivelse:
      "Alle videoene til Kjemi 1 på videregående, sortert etter tema og i anbefalt rekkefølge. Fra atomer og bindinger til støkiometri, termokjemi og likevekter.",
    temaer: [
      { slug: "atomer-og-periodesystemet", navn: "Atomer og periodesystemet", ikon: "atom", farge: "#2F6FDB",
        beskrivelse: "Atomets oppbygging, atommodellene og trendene i periodesystemet: atomstørrelse, elektronegativitet og ioniseringsenergi." },
      { slug: "sterke-og-svake-bindinger", navn: "Sterke og svake bindinger", ikon: "molekyl", farge: "#7A4FD6",
        beskrivelse: "Ionebinding, kovalent binding og metallbinding, navnsetting av salter og molekyler, prikkformler, VSEPR, polaritet og bindinger mellom molekyler." },
      { slug: "kjemiske-reaksjoner", navn: "Kjemiske reaksjoner", ikon: "kolbe", farge: "#C2417A",
        beskrivelse: "Reaksjonslikninger og balansering, og de viktigste reaksjonstypene: redoks, felling, kompleksdannelse og syre-base." },
      { slug: "stokiometri", navn: "Støkiometri", ikon: "vekt", farge: "#B98A06",
        beskrivelse: "Kjemisk regning: molarmasse, stoffmengde, konsentrasjon, fortynning, mengdeforhold og begrensende reaktant." },
      { slug: "termokjemi", navn: "Termokjemi", ikon: "flamme", farge: "#E0662B",
        beskrivelse: "Energi i kjemiske reaksjoner: entalpi, eksoterme og endoterme reaksjoner, energidiagram, entalpiberegninger og reaksjonsfart." },
      { slug: "likevekter", navn: "Likevekter", ikon: "likevekt", farge: "#1F9E8A",
        beskrivelse: "Reversible reaksjoner, kjemisk likevekt, massevirkningsloven, likevektskonstanten og Le Châteliers prinsipp." },
      { slug: "syrer-og-baser", navn: "Syrer og baser", ikon: "draape", farge: "#4C9A2A",
        beskrivelse: "Syrer, baser, pH og titrering." },
      { slug: "organisk-kjemi", navn: "Organisk kjemi", ikon: "benzen", farge: "#5F6F86",
        beskrivelse: "Hydrokarboner, funksjonelle grupper, navnsetting og organiske reaksjoner." },
      { slug: "miljoanalyse", navn: "Miljøanalyse", ikon: "blad", farge: "#2C8DB8",
        beskrivelse: "Kjemiske analysemetoder brukt på prøver fra miljøet." },
    ],
  },
  {
    slug: "kjemi-2",
    navn: "Kjemi 2",
    beskrivelse: "Videoer til Kjemi 2 på videregående. Videoene legges ut fortløpende.",
    temaer: [],
  },
];
