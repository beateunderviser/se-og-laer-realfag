// Innstillinger for nettsiden. Endre tekster og temaer her.

export const SITE = {
  navn: "Se og lær realfag",
  forfatter: "Beate Tollefsen",
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
    laereplan: { navn: "Læreplan i kjemi (KJE01-02), kompetansemål etter Kjemi 1", url: "https://www.udir.no/lk20/kje01-02/kompetansemaal-og-vurdering/kv532" },
    // Offisiell tekst fra Udir. «gjennomgaende» = mål som jobbes med i alle temaer.
    kompetansemal: [
      { kode: "KM6209", tekst: "forstå og bruke kjemisk terminologi og regler for navnsetting i faglig kommunikasjon" },
      { kode: "KM6238", gjennomgaende: true, tekst: "planlegge og gjennomføre forsøk, estimere usikkerhet og vurdere feilkilder, presentere resultater og argumentere for gyldigheten av resultater og konklusjoner" },
      { kode: "KM6223", gjennomgaende: true, tekst: "bruke informasjon fra sikkerhetsdatablad til å gjøre vurderinger knyttet til helse, miljø og sikkerhet i praktisk arbeid" },
      { kode: "KM6237", gjennomgaende: true, tekst: "bruke data, simuleringer og beregninger i tolkninger og til å trekke konklusjoner" },
      { kode: "KM6234", tekst: "bruke modeller til å forklare observasjoner og kjemiske fenomener, og argumentere for modellenes styrker og begrensinger" },
      { kode: "KM6232", tekst: "gjøre rede for oppbygningen av periodesystemet, og bruke kjerneladning og elektronkonfigurasjon til å forklare periodiske trender" },
      { kode: "KM6231", tekst: "gjøre rede for kjemisk binding som elektrostatiske krefter som virker mellom partikler, og bruke dette til å forklare molekylgeometri og organiske og uorganiske stoffers struktur, sammensetning og egenskaper" },
      { kode: "KM6235", tekst: "utforske og gjøre beregninger på kjemiske reaksjoner, og bruke observasjoner og teoretiske vurderinger til å identifisere reaksjonstype" },
      { kode: "KM6236", tekst: "gjøre beregninger med ulike enheter for konsentrasjon og bruke stoffkonsentrasjon i vurderinger av vann- og luftkvalitet" },
      { kode: "KM6233", tekst: "gjennomføre volumetrisk og gravimetrisk titreranalyse og drøfte bruk av titreranalyse" },
      { kode: "KM6224", tekst: "gjøre rede for sammenhengen mellom atomets oppbygning og grunnstoffers absorbsjons- og emisjonsspektre og bruke spektroskopiske metoder i kvalitativ og kvantitativ analyse" },
      { kode: "KM6229", tekst: "gjøre rede for entalpi og bruke beregninger og forsøk til å utforske entalpiendringer i reaksjoner" },
      { kode: "KM6230", tekst: "gjøre rede for kollisjonsteori og utforske faktorer som påvirker reaksjonsfart og kjemisk likevekt" },
      { kode: "KM6227", tekst: "utforske løseligheten til stoffer, og gjøre rede for betydningen av ladning, polaritet og temperatur for løselighet" },
      { kode: "KM6228", tekst: "gjøre rede for begrepene syre, base, protolyse og pH, og utforske egenskapene til sterke og svake syrer og baser" },
      { kode: "KM6226", tekst: "gjøre rede for prinsipper for grønn kjemi og drøfte hvordan bruk av prinsippene kan bidra til bærekraftig utvikling" },
      { kode: "KM6225", gjennomgaende: true, tekst: "presentere kjemifaglig innhold fra ulike kilder, kritisk vurdere kildene og bruke relevant teori til å drøfte innholdet" },
    ],
    temaer: [
      { slug: "atomer-og-periodesystemet", mal: ["KM6232", "KM6234"], navn: "Atomer og periodesystemet", ikon: "atom", farge: "#2F6FDB",
        beskrivelse: "Atomets oppbygging, atommodellene og trendene i periodesystemet: atomstørrelse, elektronegativitet og ioniseringsenergi." },
      { slug: "sterke-og-svake-bindinger", mal: ["KM6231", "KM6209", "KM6227"], navn: "Sterke og svake bindinger", ikon: "molekyl", farge: "#7A4FD6",
        beskrivelse: "Ionebinding, kovalent binding og metallbinding, navnsetting av salter og molekyler, prikkformler, VSEPR, polaritet og bindinger mellom molekyler." },
      { slug: "kjemiske-reaksjoner", mal: ["KM6235", "KM6227", "KM6228"], navn: "Kjemiske reaksjoner", ikon: "kolbe", farge: "#C2417A",
        beskrivelse: "Reaksjonslikninger og balansering, og de viktigste reaksjonstypene: redoks, felling, kompleksdannelse og syre-base." },
      { slug: "stokiometri", mal: ["KM6235", "KM6236"], navn: "Støkiometri", ikon: "vekt", farge: "#B98A06",
        beskrivelse: "Kjemisk regning: molarmasse, stoffmengde, konsentrasjon, fortynning, mengdeforhold og begrensende reaktant." },
      { slug: "termokjemi", mal: ["KM6229", "KM6230"], navn: "Termokjemi", ikon: "flamme", farge: "#E0662B",
        beskrivelse: "Energi i kjemiske reaksjoner: entalpi, eksoterme og endoterme reaksjoner, energidiagram, entalpiberegninger og reaksjonsfart." },
      { slug: "likevekter", mal: ["KM6230"], navn: "Likevekter", ikon: "likevekt", farge: "#1F9E8A",
        beskrivelse: "Reversible reaksjoner, kjemisk likevekt, massevirkningsloven, likevektskonstanten og Le Châteliers prinsipp." },
      { slug: "syrer-og-baser", mal: ["KM6228", "KM6233"], navn: "Syrer og baser", ikon: "draape", farge: "#4C9A2A",
        beskrivelse: "Syrer, baser, pH og titrering." },
      { slug: "organisk-kjemi", mal: ["KM6231", "KM6209"], navn: "Organisk kjemi", ikon: "benzen", farge: "#5F6F86",
        beskrivelse: "Hydrokarboner, funksjonelle grupper, navnsetting og organiske reaksjoner." },
      { slug: "miljoanalyse", mal: ["KM6236", "KM6233", "KM6224", "KM6226"], navn: "Miljøanalyse", ikon: "blad", farge: "#2C8DB8",
        beskrivelse: "Kjemiske analysemetoder brukt på prøver fra miljøet." },
    ],
  },
  {
    slug: "kjemi-2",
    navn: "Kjemi 2",
    beskrivelse: "Videoer til Kjemi 2 på videregående. Videoene legges ut fortløpende.",
    laereplan: { navn: "Læreplan i kjemi (KJE01-02), kompetansemål etter Kjemi 2", url: "https://www.udir.no/lk20/kje01-02/kompetansemaal-og-vurdering/kv533" },
    kompetansemal: [
      { kode: "KM6222", tekst: "forstå og bruke kjemisk terminologi og fagspråk i faglig kommunikasjon" },
      { kode: "KM6221", tekst: "planlegge og gjennomføre forsøk, drøfte metode og tiltak for å redusere risiko og vurdere usikkerhet og feilkilder i egne og andres forsøk" },
      { kode: "KM6219", tekst: "gjøre rede for hvordan naturvitenskapelige modeller og teorier utvikles, og reflektere over hvordan samarbeid bidrar til kunnskapsutvikling i kjemi" },
      { kode: "KM6214", tekst: "utforske redoksreaksjoner og bruke beregninger til å vurdere sammenhenger mellom masse, ladning, spenning og energi i elektrokjemiske reaksjoner" },
      { kode: "KM6239", tekst: "utforske likevekter og bruke massevirkningsloven til å gjøre beregninger og forklare observasjoner" },
      { kode: "KM6215", tekst: "gjøre rede for entropibegrepet og bruke entropi og entalpi til å vurdere spontanitet og endringer i likevektsystemer" },
      { kode: "KM6213", tekst: "utforske og beregne pH i vannløsninger og drøfte betydningen av buffere for regulering av pH i naturlige og industrielle prosesser" },
      { kode: "KM6212", tekst: "utforske og gjøre beregninger av løseligheten til stoffer og gjøre vurderinger av løselighet i biologiske og industrielle prosesser" },
      { kode: "KM6216", tekst: "utforske katalyserte reaksjoner og gjøre rede for betydningen av katalysatorer i biologiske og industrielle prosesser" },
      { kode: "KM6240", tekst: "gjøre rede for reaksjonstypene addisjon, eliminasjon, substitusjon, hydrolyse og kondensasjon og bruke elektrostatiske krefter til å forklare noen enkle reaksjonsmekanismer" },
      { kode: "KM6220", tekst: "gjennomføre synteser og gjøre rede for faktorer som påvirker utbytte og renhet i synteser" },
      { kode: "KM6218", tekst: "gjøre rede for prinsipper for kromatografi og bruke kromatografi for å separere og analysere organiske stoffblandinger" },
      { kode: "KM6217", tekst: "beskrive oppbygningen til noen biologiske makromolekyler og vurdere hvordan ytre faktorer kan påvirke molekylenes struktur og egenskaper" },
      { kode: "KM6211", tekst: "gi eksempler på produksjon, gjenvinning, deponering og nedbryting av noen metaller og noen typer plast, og drøfte tiltak som er i samsvar med prinsipper for grønn kjemi" },
      { kode: "KM6210", tekst: "utforske en teoretisk eller praktisk problemstilling, og drøfte og presentere funn" },
    ],
    temaer: [],
  },
];
