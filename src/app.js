// Se og lær realfag – avhuking, fremdrift, videospiller, søk og eksamensmodus.
(() => {
  const les = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const lagre = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const sett = new Set(les("sl-sett", []));

  function oppdater() {
    document.querySelectorAll("[data-sett]").forEach((b) => {
      const on = sett.has(b.dataset.sett);
      b.setAttribute("aria-pressed", on);
      const t = b.querySelector(".tekst");
      if (t) t.textContent = on ? "Sett" : "Marker som sett";
      if (b.classList.contains("dot")) b.setAttribute("aria-label", on ? "Sett – klikk for å fjerne" : "Marker som sett");
    });
    document.querySelectorAll(".fremdrift").forEach((el) => {
      let ids = el.dataset.ids ? el.dataset.ids.split(",").filter(Boolean) : [];
      const n = ids.filter((i) => sett.has(i)).length;
      const p = ids.length ? Math.round((100 * n) / ids.length) : 0;
      el.querySelector(".linje i").style.width = p + "%";
      const ant = el.querySelector(".ant"), pst = el.querySelector(".pst");
      if (ant) ant.textContent = `${n} av ${ids.length} sett`;
      if (pst) pst.textContent = p + " %";
    });
    document.querySelectorAll(".flis[data-ids]").forEach((f) => {
      const ids = f.dataset.ids.split(",");
      f.classList.toggle("fullfort", ids.every((i) => sett.has(i)));
    });
    if (eks) eksamen();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sett]");
    if (b) {
      e.preventDefault();
      const id = b.dataset.sett;
      sett.has(id) ? sett.delete(id) : sett.add(id);
      lagre("sl-sett", [...sett]);
      oppdater();
    }
  });

  // Videospiller: laster YouTube først når eleven trykker play
  const skjerm = document.querySelector(".skjerm[data-yt]");
  function spill(start = 0) {
    if (!skjerm) return;
    const id = skjerm.dataset.yt;
    skjerm.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&start=${start}" title="YouTube-video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  }
  if (skjerm) {
    skjerm.querySelector(".spill").addEventListener("click", () => spill());
    document.querySelectorAll("a[data-t]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      spill(+a.dataset.t);
      skjerm.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }

  // Søk
  const q = document.getElementById("q"), treff = document.getElementById("treff");
  let indeks = null, valgt = -1;
  const normal = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  async function hentIndeks() {
    if (!indeks) {
      try { indeks = (await (await fetch("/sok.json")).json()).map((v) => ({ ...v, n: normal(`${v.t} ${v.m}`), x: normal(v.s) })); }
      catch { indeks = []; }
    }
  }
  async function sok() {
    const s = normal(q.value.trim());
    if (!s) { treff.hidden = true; return; }
    await hentIndeks();
    const ord = s.split(/\s+/);
    const res = indeks
      .map((v) => {
        if (!ord.every((o) => v.n.includes(o) || v.x.includes(o))) return null;
        return { v, poeng: ord.reduce((a, o) => a + (normal(v.t).includes(o) ? 3 : v.n.includes(o) ? 2 : 1), 0) };
      })
      .filter(Boolean).sort((a, b) => b.poeng - a.poeng).slice(0, 12).map((x) => x.v);
    valgt = -1;
    treff.innerHTML = res.length
      ? res.map((v) => `<a href="${v.u}" style="--c:${v.f}"><i></i><span><b>${esc(v.t)}</b><small>${esc(v.m)} · ${esc(v.k)}</small></span></a>`).join("")
      : `<div class="ingen">Ingen videoer passer til «${esc(q.value)}».</div>`;
    treff.hidden = false;
  }
  if (q) {
    q.addEventListener("input", sok);
    q.addEventListener("focus", () => { hentIndeks(); if (q.value) sok(); });
    q.addEventListener("keydown", (e) => {
      const lenker = [...treff.querySelectorAll("a")];
      if (e.key === "Escape") { q.value = ""; treff.hidden = true; }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!lenker.length) return;
        e.preventDefault();
        valgt = (valgt + (e.key === "ArrowDown" ? 1 : -1) + lenker.length) % lenker.length;
        lenker.forEach((l, i) => l.classList.toggle("valgt", i === valgt));
      } else if (e.key === "Enter" && lenker.length) {
        location.href = lenker[Math.max(valgt, 0)].href;
      }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".sok")) treff.hidden = true; });
  }

  // Eksamensmodus
  const eks = document.getElementById("eksamen");
  const valgte = new Set(les("sl-eksamen", []));
  const dato = document.getElementById("edato");
  function eksamen() {
    eks.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", valgte.has(c.dataset.tema)));
    const ids = [];
    eks.querySelectorAll(".gruppe").forEach((g) => {
      g.hidden = !valgte.has(g.dataset.gruppe);
      if (!g.hidden) g.querySelectorAll("li[data-id]").forEach((li) => ids.push(li.dataset.id));
    });
    document.getElementById("eks-tom").hidden = ids.length > 0;
    const fr = document.getElementById("eks-fremdrift");
    const n = ids.filter((i) => sett.has(i)).length, p = ids.length ? Math.round((100 * n) / ids.length) : 0;
    fr.innerHTML = ids.length ? `<div class="fremdrift"><div class="fremdrift-tekst"><span>${n} av ${ids.length} sett</span><span>${p} %</span></div><div class="linje"><i style="width:${p}%"></i></div></div>` : "";
    const ned = document.getElementById("nedtelling");
    ned.innerHTML = "";
    if (dato.value) {
      const dager = Math.ceil((new Date(dato.value + "T09:00") - new Date()) / 864e5);
      const igjen = ids.length - n;
      if (dager < 0) ned.innerHTML = `<p class="ingress">Datoen har passert.</p>`;
      else ned.innerHTML = `<div class="nedtelling">
        <div><div class="tall">${dager}</div><span>${dager === 1 ? "dag" : "dager"} til eksamen</span></div>
        ${ids.length ? `<div><div class="tall">${igjen}</div><span>videoer igjen</span></div>` : ""}
        ${ids.length && dager > 0 && igjen ? `<div><div class="tall">${Math.ceil(igjen / dager)}</div><span>videoer per dag</span></div>` : ""}
      </div>`;
    }
  }
  if (eks) {
    dato.value = les("sl-dato", "");
    eks.addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      valgte.has(c.dataset.tema) ? valgte.delete(c.dataset.tema) : valgte.add(c.dataset.tema);
      lagre("sl-eksamen", [...valgte]);
      eksamen();
    });
    dato.addEventListener("change", () => { lagre("sl-dato", dato.value); eksamen(); });
  }

  // Quiz
  const quizLagret = les("sl-quiz", {});
  function visQuizMerker() {
    document.querySelectorAll("[data-quiz-merke]").forEach((m) => {
      const r = quizLagret[m.dataset.quizMerke];
      m.classList.toggle("tatt", !!r);
      m.textContent = r ? `Quiz ${r.riktige}/${r.totalt}` : "Quiz";
    });
  }
  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const sporsmal = [...quiz.querySelectorAll(".sporsmal")];
    const resultat = quiz.querySelector(".quiz-resultat");
    function sjekkFerdig() {
      const besvart = sporsmal.filter((s) => s.dataset.besvart);
      if (besvart.length < sporsmal.length) return;
      const riktige = besvart.filter((s) => s.dataset.besvart === "ok").length;
      resultat.querySelector("p").textContent = `Du fikk ${riktige} av ${sporsmal.length} riktige.` + (riktige === sporsmal.length ? " Godt jobbet!" : " Se gjerne videoen igjen og prøv på nytt.");
      resultat.hidden = false;
      quizLagret[quiz.dataset.quiz] = { riktige, totalt: sporsmal.length };
      lagre("sl-quiz", quizLagret);
    }
    sporsmal.forEach((s) => {
      s.querySelectorAll(".alternativ").forEach((b) => b.addEventListener("click", () => {
        if (s.dataset.besvart) return;
        const riktig = +s.dataset.riktig, valgt = +b.dataset.svar, ok = valgt === riktig;
        s.dataset.besvart = ok ? "ok" : "nei";
        s.querySelectorAll(".alternativ").forEach((x) => {
          x.disabled = true;
          const i = +x.dataset.svar;
          if (i === riktig) x.classList.add("riktig");
          else if (i === valgt) x.classList.add("feil");
          else x.classList.add("nedtonet");
        });
        const t = s.querySelector(".tilbakemelding");
        t.className = "tilbakemelding " + (ok ? "ok" : "nei");
        t.querySelector("strong").textContent = ok ? "Riktig!" : `Ikke helt. Riktig svar er ${"ABCD"[riktig]}.`;
        t.hidden = false;
        sjekkFerdig();
      }));
    });
    quiz.querySelector(".quiz-igjen").addEventListener("click", () => {
      sporsmal.forEach((s) => {
        delete s.dataset.besvart;
        s.querySelectorAll(".alternativ").forEach((x) => { x.disabled = false; x.classList.remove("riktig", "feil", "nedtonet"); });
        s.querySelector(".tilbakemelding").hidden = true;
      });
      resultat.hidden = true;
      sporsmal[0].scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  visQuizMerker();

  oppdater();
})();
