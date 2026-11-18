/* Common Criteria Parte 2 · lógica del recurso interactivo */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, cls) => `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const STORE_KEY = "cc-parte2-progreso-v1";
  const THEME_KEY = "cc-parte2-tema-v1";
  const ACTIVITIES = ["conceptos", "catalogo", "dragwords", "match", "map", "scenarios", "evaluacion", "resumen"];
  const NAV = [
    { id: "inicio", label: "Inicio", icon: "home" },
    { id: "conceptos", label: "Conceptos", icon: "cards" },
    { id: "catalogo", label: "Clases y familias", icon: "layout-grid" },
    { id: "practica", label: "Práctica", icon: "puzzle" },
    { id: "evaluacion", label: "Evaluación", icon: "clipboard-check" },
    { id: "resumen", label: "Resumen", icon: "books" }
  ];
  const SUBTABS = [
    { id: "keywords", label: "Palabras clave", icon: "key" },
    { id: "map", label: "Mapa de familias", icon: "target" },
    { id: "scenarios", label: "Vulneraciones", icon: "shield-check" }
  ];

  function loadDone() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return ACTIVITIES.reduce((acc, k) => { acc[k] = !!raw[k]; return acc; }, {});
    } catch (e) { return ACTIVITIES.reduce((a, k) => (a[k] = false, a), {}); }
  }

  const state = {
    view: "inicio",
    subtab: "keywords",
    done: loadDone(),
    flipped: new Set(),
    visited: new Set(),
    conceptPage: 0,
    catalogCode: "FAU",
    catalogPage: 0,
    familyPage: 0,
    dragIndex: 0,
    dragAnswers: DRAG_SENTENCES.map(() => [null, null]),
    dragSelectedBlank: null,
    dragChecked: false,
    dragCompleted: new Set(),
    matchPage: 0,
    matchSelected: null,
    matchAssignments: {},
    matchChecked: false,
    matchCompleted: new Set(),
    mapRound: 0,
    mapPlaced: [],
    mapChecked: false,
    mapCompleted: new Set(),
    scIndex: 0,
    scClass: null,
    scFam: null,
    scChecked: false,
    scCompleted: new Set(),
    quizIndex: 0,
    quizAnswers: Array(QUIZ_PLAN.length).fill(null),
    quizSubmitted: false,
    quizShowAll: false
  };

  /* ---------- Utilidades ---------- */
  function shuffleSeeded(arr, seed) {
    const copy = arr.slice();
    copy.sort((a, b) => pseudo(seed + "|" + a) - pseudo(seed + "|" + b));
    return copy;
  }
  function pseudo(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }
  function optionsFor(correct, pool, count, seed) {
    const others = shuffleSeeded(pool.filter((x) => x !== correct), seed).slice(0, count - 1);
    return shuffleSeeded([correct].concat(others), seed + "#");
  }
  function classByCode(code) { return CLASSES.find((c) => c.code === code); }
  function familyInfo(code) {
    return ALL_FAMILIES.find((x) => x.code === code || x.cls + "_" + x.code === code);
  }
  function markDone(key) {
    if (state.done[key]) return;
    state.done[key] = true;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.done)); } catch (e) { /* almacenamiento no disponible */ }
    updateProgress();
    toast("Actividad completada");
  }
  function updateProgress() {
    const n = ACTIVITIES.filter((k) => state.done[k]).length;
    const pct = Math.round((n / ACTIVITIES.length) * 100);
    $("#progressFill").style.width = pct + "%";
    $("#progressLabel").textContent = pct + "%";
    $$(".nav-item").forEach((el) => el.classList.toggle("is-done", !!state.done[el.dataset.view] || (el.dataset.view === "practica" && ["dragwords", "match", "map", "scenarios"].every((k) => state.done[k]))));
  }
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2300);
  }
  function feedback(kind, title, text) {
    return `<div class="feedback is-${kind}"><strong>${esc(title)}</strong>${esc(text)}</div>`;
  }
  function head(kicker, title, intro, iconName) {
    return `<div class="view-head"><div class="view-kicker">${icon(iconName || "info-circle")}${esc(kicker)}</div><h2 id="title-${state.view}">${esc(title)}</h2><p>${esc(intro)}</p></div>`;
  }
  function pager(page, pages, action) {
    if (pages < 2) return "";
    return `<div class="pager"><button class="btn" data-action="${action}" data-dir="-1" ${page === 0 ? "disabled" : ""}>${icon("arrow-left")} Anterior</button><span class="pager-info">${page + 1} / ${pages}</span><button class="btn" data-action="${action}" data-dir="1" ${page === pages - 1 ? "disabled" : ""}>Siguiente ${icon("arrow-right")}</button></div>`;
  }

  /* ---------- Navegación y tema ---------- */
  function renderNav() {
    $("#nav").innerHTML = NAV.map((n) => `<button type="button" class="nav-item ${state.view === n.id ? "is-active" : ""}" data-action="nav" data-view="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span><span class="nav-dot" title="Completado"></span></button>`).join("");
    $("#brandIcon").innerHTML = icon("shield-check");
    $("#statClasses").textContent = CLASSES.length + " clases";
    $("#statFamilies").textContent = ALL_FAMILIES.length + " familias";
  }
  function renderTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    const btn = $("#themeToggle");
    btn.innerHTML = icon(dark ? "sun" : "moon");
    btn.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
    btn.title = dark ? "Modo claro" : "Modo oscuro";
  }
  function go(view) {
    state.view = view;
    $$(".view").forEach((el) => { el.hidden = el.dataset.view !== view; });
    renderNav();
    updateProgress();
    renderView();
    const main = $("#main");
    if (main && typeof main.scrollIntoView === "function") main.scrollIntoView({ behavior: "smooth", block: "start" });
    if (view === "resumen") markDone("resumen");
  }
  function renderView() {
    const map = { inicio: renderInicio, conceptos: renderConceptos, catalogo: renderCatalogo, practica: renderPractica, evaluacion: renderQuiz, resumen: renderResumen };
    (map[state.view] || renderInicio)();
  }

  /* ---------- Inicio ---------- */
  function renderInicio() {
    $("#view-inicio").innerHTML = head("Guía interactiva", "Aprende la Parte 2 de Common Criteria", "Once clases, sesenta y seis familias y un objetivo claro: reconocer qué requisito se está vulnerando.", "shield-check") + `
      <div class="hero">
        <div class="card hero-main">
          <p class="eyebrow">SFR · Requisitos funcionales de seguridad</p>
          <h2>De la definición al análisis de escenarios</h2>
          <p class="lead">Recorre las clases y familias del catálogo CC v3.1, manipula ejemplos reales y comprueba si puedes identificar el componente que falta.</p>
          <div class="row-actions">
            <button class="btn btn-primary" data-action="nav" data-view="conceptos">Empezar a aprender ${icon("arrow-right")}</button>
            <button class="btn" data-action="nav" data-view="catalogo">Ver catálogo ${icon("layout-grid")}</button>
          </div>
        </div>
        <div class="hero-side">
          <div class="card stat-card"><span class="stat-icon">${icon("layout-grid")}</span><div><b>11</b><span>clases funcionales</span></div></div>
          <div class="card stat-card"><span class="stat-icon">${icon("list-check")}</span><div><b>66</b><span>familias explicadas</span></div></div>
          <div class="card stat-card"><span class="stat-icon">${icon("target")}</span><div><b>16</b><span>escenarios de práctica</span></div></div>
        </div>
      </div>
      <div class="steps">
        <div class="card step"><div class="step-num">1</div><h3>Recuerda</h3><p>Tarjetas con el propósito y la mnemotecnia de cada clase.</p></div>
        <div class="card step"><div class="step-num">2</div><h3>Ubica</h3><p>Asocia palabras clave y familias con su clase correcta.</p></div>
        <div class="card step"><div class="step-num">3</div><h3>Analiza</h3><p>Detecta el SFR vulnerado en escenarios y en el examen final.</p></div>
      </div>`;
  }

  /* ---------- Conceptos ---------- */
  function renderConceptos() {
    const perPage = 6;
    const pages = Math.ceil(CLASSES.length / perPage);
    const items = CLASSES.slice(state.conceptPage * perPage, (state.conceptPage + 1) * perPage);
    const cards = items.map((c) => `
      <button type="button" class="flip ${state.flipped.has(c.code) ? "is-flipped" : ""}" data-action="flip" data-code="${c.code}" aria-label="Tarjeta ${c.code}: pulsa para girar">
        <span class="flip-inner">
          <span class="flip-face">
            <span class="flip-code"><b>${c.code}</b>${icon(c.icon)}</span>
            <h3>${esc(c.concept.q)}</h3>
            <p>${esc(c.protects)}</p>
            <span class="flip-hint">${icon("rotate")} Pulsa para ver la respuesta</span>
          </span>
          <span class="flip-face is-back">
            <span class="flip-code"><b>${c.code}</b><span class="chip">${c.families.length} familias</span></span>
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.concept.a)}</p>
            <span class="flip-hint">${icon("bulb")} Regla: ${esc(c.mnemonic)}</span>
          </span>
        </span>
      </button>`).join("");
    $("#view-conceptos").innerHTML = head("Módulo 1 · Recordar", "Conceptos esenciales", "Gira cada tarjeta. El frente plantea qué protege la clase; el reverso da la respuesta y una regla mnemotécnica.", "cards") + `
      <div class="notice">${icon("info-circle")}<span>Consejo: intenta responder antes de girar. Después comprueba y repite las que falles.</span></div>
      <div class="card-grid" style="margin-top:18px">${cards}</div>
      ${pager(state.conceptPage, pages, "concept-page")}
      ${state.flipped.size === CLASSES.length ? `<div class="row-actions"><button class="btn btn-primary" data-action="nav" data-view="catalogo">Continuar al catálogo ${icon("arrow-right")}</button></div>` : ""}`;
  }

  /* ---------- Catálogo ---------- */
  function renderCatalogo() {
    const perPage = 6;
    const pages = Math.ceil(CLASSES.length / perPage);
    const list = CLASSES.slice(state.catalogPage * perPage, state.catalogPage * perPage + perPage);
    const cls = classByCode(state.catalogCode);
    const famPages = Math.ceil(cls.families.length / 6);
    const famPage = Math.min(state.familyPage, famPages - 1);
    const fams = cls.families.slice(famPage * 6, famPage * 6 + 6);
    $("#view-catalogo").innerHTML = head("Módulo 1 · Comprender", "Catálogo de clases y familias", "Selecciona una clase para ver qué protege, sus palabras clave y todas sus familias con una explicación breve.", "layout-grid") + `
      <div class="catalog-layout">
        <div class="card">
          <p class="round-label">Clases · ${state.catalogPage + 1} de ${pages}</p>
          <div class="class-list" style="margin-top:12px">${list.map((c) => `<button type="button" class="class-option ${c.code === state.catalogCode ? "is-active" : ""}" data-action="class-select" data-code="${c.code}"><b>${c.code}</b><span>${esc(c.name)}</span></button>`).join("")}</div>
          ${pager(state.catalogPage, pages, "catalog-page")}
        </div>
        <div class="card catalog-detail">
          <div class="flip-code"><h3>${cls.code} · ${esc(cls.name)}</h3><span class="chip">${icon(cls.icon)}</span></div>
          <p class="detail-sub">${esc(cls.protects)} · <strong>Regla:</strong> ${esc(cls.mnemonic)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px">${cls.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>
          <p class="round-label">Familias · ${famPage + 1} de ${famPages}</p>
          <div class="family-grid" style="margin-top:10px">${fams.map((f) => `<div class="family-item"><b>${cls.code}_${f.code}</b><p>${esc(f.desc)}</p><em>${esc(f.en)}</em></div>`).join("")}</div>
          ${famPages > 1 ? pager(famPage, famPages, "family-page") : ""}
        </div>
      </div>`;
  }

  /* ---------- Práctica ---------- */
  function renderPractica() {
    const titles = {
      keywords: "Palabras clave",
      map: "Mapa de familias",
      scenarios: "Detección de vulneraciones"
    };
    const intros = {
      keywords: "Completa frases con el término correcto y empareja cada palabra clave con su clase.",
      map: "Coloca en la zona solo las familias que pertenecen a la clase indicada.",
      scenarios: "Lee el escenario. Primero elige la clase y después la familia del componente que se incumple."
    };
    $("#view-practica").innerHTML = head("Módulo 2 y 3 · Aplicar", titles[state.subtab], intros[state.subtab], "puzzle") + `
      <div class="subtabs">${SUBTABS.map((t) => `<button type="button" class="subtab ${state.subtab === t.id ? "is-active" : ""}" data-action="subtab" data-tab="${t.id}">${icon(t.icon)}${esc(t.label)}</button>`).join("")}</div>
      <div class="subview" id="sub-${state.subtab}"></div>`;
    ({ keywords: renderDragWords, map: renderMap, scenarios: renderScenarios })[state.subtab]();
  }

  /* --- Drag the Words --- */
  function renderDragWords() {
    const s = DRAG_SENTENCES[state.dragIndex];
    const answers = state.dragAnswers[state.dragIndex];
    const bank = shuffleSeeded(s.answers.concat(s.distractors), "bank" + state.dragIndex);
    let sentence = "";
    s.parts.forEach((part, i) => {
      sentence += esc(part);
      if (i < 2) {
        const val = answers[i];
        let cls = "blank " + (val ? "" : "is-empty");
        if (state.dragChecked) cls += val === s.answers[i] ? " is-correct" : " is-wrong";
        else if (state.dragSelectedBlank === i) cls += " is-correct";
        sentence += `<button type="button" class="${cls}" data-action="blank" data-i="${i}" data-drop="blank" aria-label="Espacio ${i + 1}">${val ? esc(val) : "••••"}</button>`;
      }
    });
    const allFilled = answers.every(Boolean);
    $("#sub-keywords").innerHTML = `
      <div class="card practice-card">
        <p class="round-label">Completa la frase · ${state.dragIndex + 1} de ${DRAG_SENTENCES.length}</p>
        <div class="sentence">${sentence}</div>
        <p class="round-label">Arrastra o pulsa una palabra</p>
        <div class="word-bank" style="margin-top:10px">${bank.map((w) => `<button type="button" class="word ${answers.includes(w) ? "is-used" : ""}" data-action="word" draggable="true" data-drag="word" data-word="${esc(w)}">${esc(w)}</button>`).join("")}</div>
        ${state.dragChecked ? feedback(allFilled && answers.every((a, i) => a === s.answers[i]) ? "ok" : "warn", allFilled && answers.every((a, i) => a === s.answers[i]) ? "Correcto" : "Revisa la frase", "Respuesta correcta: " + s.answers.map((a) => "«" + a + "»").join(" y ") + ".") : ""}
        <div class="row-actions">
          <button class="btn btn-primary" data-action="drag-check" ${state.dragChecked || !allFilled ? "disabled" : ""}>${icon("check")} Comprobar</button>
          ${state.dragChecked ? `<button class="btn" data-action="drag-next">${state.dragIndex === DRAG_SENTENCES.length - 1 ? "Pasar a emparejar" : "Siguiente frase"} ${icon("arrow-right")}</button>` : ""}
          <button class="btn" data-action="drag-reset">${icon("rotate")} Limpiar</button>
        </div>
      </div>`;
  }

  /* --- Emparejar --- */
  function renderMatch() {
    const perPage = 6;
    const pages = Math.ceil(KEYWORD_MATCH.length / perPage);
    const items = KEYWORD_MATCH.slice(state.matchPage * perPage, state.matchPage * perPage + perPage);
    const codes = Array.from(new Set(items.map((x) => x.cls)));
    const selected = state.matchSelected !== null ? KEYWORD_MATCH[state.matchSelected] : null;
    $("#sub-keywords").innerHTML = `
      <div class="card practice-card">
        <p class="round-label">Empareja la pista con la clase · ${state.matchPage + 1} de ${pages}</p>
        <div class="notice" style="margin:12px 0 18px">${icon("info-circle")}<span>Pulsa una pista y después su clase. También puedes arrastrar la pista hasta el destino.</span></div>
        <div class="match-layout">
          <div class="match-column"><h3>Pistas</h3><div class="match-list">${items.map((it, i) => {
            const gi = state.matchPage * perPage + i;
            const assigned = state.matchAssignments[gi];
            let cls = "match-item";
            if (state.matchSelected === gi) cls += " is-selected";
            if (state.matchChecked && assigned) cls += assigned === it.cls ? " is-correct" : " is-wrong";
            return `<button type="button" class="${cls}" draggable="true" data-drag="keyword" data-index="${gi}" data-action="match-select" data-i="${gi}"><span>${esc(it.keyword)}</span><span class="mini-code">${assigned ? esc(assigned) : "…"}</span></button>`;
          }).join("")}</div></div>
          <div class="match-column"><h3>Clases</h3><div class="match-list">${codes.map((code) => `<button type="button" class="target ${selected ? "is-over" : ""}" data-action="match-target" data-cls="${code}" data-drop="target"><b>${code}</b><span>${esc(classByCode(code).name)}</span><span class="target-value">${selected ? "← suelta aquí" : ""}</span></button>`).join("")}</div></div>
        </div>
        ${state.matchChecked ? feedback("ok", "Comprobado", "Revisa el color de cada fila: verde cuando la pista y la clase coinciden.") : ""}
        <div class="row-actions">
          <button class="btn btn-primary" data-action="match-check">${icon("check")} Comprobar grupo</button>
          ${pages > 1 ? `<button class="btn" data-action="match-page" data-dir="${state.matchPage === 0 ? 1 : -1}">${state.matchPage === 0 ? "Siguiente grupo" : "Grupo anterior"} ${icon("arrow-right")}</button>` : ""}
          <button class="btn" data-action="match-reset">${icon("rotate")} Limpiar</button>
        </div>
      </div>`;
  }

  /* --- Mapa de familias --- */
  function renderMap() {
    const round = MAP_ROUNDS[state.mapRound];
    const cls = classByCode(round.cls);
    const correct = cls.families.map((x) => x.code);
    const remaining = round.pool.filter((c) => !state.mapPlaced.includes(c));
    const allDone = state.mapPlaced.length === correct.length;
    $("#sub-map").innerHTML = `
      <div class="card practice-card">
        <p class="round-label">Ronda ${state.mapRound + 1} de ${MAP_ROUNDS.length} · ${esc(cls.name)}</p>
        <div class="map-zone" data-drop="zone">
          <div class="map-zone-head">${icon(cls.icon)} <b>${round.cls}</b><span>Coloca aquí solo sus familias</span></div>
          <div class="placed-list">${state.mapPlaced.length ? state.mapPlaced.map((c) => `<button type="button" class="family-chip is-placed" data-action="map-remove" data-code="${c}">${round.cls}_${c} ${icon("x")}</button>`).join("") : `<span class="chip">Zona vacía</span>`}</div>
        </div>
        <p class="round-label">Familias disponibles · ${remaining.length}</p>
        <div class="pool" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${remaining.map((c) => `<button type="button" class="family-chip" draggable="true" data-drag="family" data-code="${c}" data-action="map-place">${c}</button>`).join("")}</div>
        ${state.mapChecked ? feedback(state.mapPlaced.every((c) => correct.includes(c)), state.mapPlaced.every((c) => correct.includes(c)) ? "Muy bien" : "Casi", state.mapPlaced.every((c) => correct.includes(c)) ? "Todas las familias colocadas pertenecen a " + round.cls + "." : "Familias correctas: " + correct.map((c) => round.cls + "_" + c).join(", ") + ".") : ""}
        <div class="row-actions">
          <button class="btn btn-primary" data-action="map-check" ${state.mapChecked || !allDone ? "disabled" : ""}>${icon("check")} Comprobar</button>
          ${state.mapChecked ? `<button class="btn" data-action="map-next">${state.mapRound === MAP_ROUNDS.length - 1 ? "Terminar mapa" : "Siguiente clase"} ${icon("arrow-right")}</button>` : ""}
          <button class="btn" data-action="map-reset">${icon("rotate")} Limpiar</button>
        </div>
      </div>`;
  }

  /* --- Escenarios --- */
  function renderScenarios() {
    const s = SCENARIOS[state.scIndex];
    const classOptions = optionsFor(s.cls, ALL_CLASSES, 4, "sc" + state.scIndex);
    const pool = state.scClass ? CLASSES.find((c) => c.code === state.scClass).families.map((x) => x.code) : [];
    const famOptions = optionsFor(s.fam, pool, Math.min(4, pool.length), "sf" + state.scIndex);
    let steps = "";
    if (state.scChecked) {
      const ok = state.scClass === s.cls && state.scFam === s.fam;
      steps = `<div class="notice" style="margin-bottom:14px">${icon("target")}<span>Tu respuesta: <strong>${esc(state.scClass)}</strong> · <strong>${esc(state.scClass)}_${esc(state.scFam)}</strong></span></div>` + feedback(ok ? "ok" : "warn", ok ? "Identificaste el SFR" : "No era ese componente", s.feedback);
    } else if (!state.scClass) {
      steps = `<div class="step-block"><p>Paso 1 · ¿Qué clase se vulnera?</p><div class="option-grid">${classOptions.map((code) => `<button type="button" class="option" data-action="sc-class" data-value="${code}"><span class="opt-code">${code}</span><span class="opt-name">${esc(classByCode(code).name)}</span></button>`).join("")}</div></div>`;
    } else {
      steps = `<div class="selection-summary" style="margin-bottom:16px">${icon("check")} Clase elegida: ${esc(state.scClass)} <button class="text-button" data-action="sc-change">cambiar</button></div>
        <div class="step-block"><p>Paso 2 · ¿Qué familia incumple el requisito?</p><div class="option-grid">${famOptions.map((code) => `<button type="button" class="option ${state.scFam === code ? "is-selected" : ""}" data-action="sc-family" data-value="${code}"><span class="opt-code">${state.scClass}_${code}</span><span class="opt-name">${esc(familyInfo(code) ? familyInfo(code).name : code)}</span></button>`).join("")}</div></div>`;
    }
    $("#sub-scenarios").innerHTML = `
      <div class="card practice-card">
        <div class="quiz-meta"><p class="round-label">Escenario ${state.scIndex + 1} de ${SCENARIOS.length}</p><span class="chip">Nivel: clase → familia</span></div>
        <div class="scenario-text">${esc(s.text)}</div>
        ${steps}
        <div class="row-actions">
          ${!state.scChecked ? `<button class="btn btn-primary" data-action="sc-check" ${state.scFam ? "" : "disabled"}>${icon("check")} Comprobar respuesta</button>` : `<button class="btn btn-primary" data-action="sc-next">${state.scIndex === SCENARIOS.length - 1 ? "Ir a la evaluación" : "Siguiente escenario"} ${icon("arrow-right")}</button>`}
          <button class="btn" data-action="sc-reset">${icon("rotate")} Reiniciar escenario</button>
        </div>
      </div>`;
  }

  /* ---------- Evaluación ---------- */
  const QUIZ = QUIZ_PLAN.map((p, idx) => {
    if (p.type === "scenario-class") {
      const s = SCENARIOS[p.i];
      return { label: "Escenario → clase", prompt: s.text, options: optionsFor(s.cls, ALL_CLASSES, 4, "q" + idx), answer: s.cls, explanation: s.feedback };
    }
    if (p.type === "scenario-sfr") {
      const s = SCENARIOS[p.i];
      const pool = CLASSES.find((c) => c.code === s.cls).families.map((x) => x.code);
      const right = s.cls + "_" + s.fam;
      const opts = optionsFor(s.fam, pool, 4, "q" + idx).map((c) => s.cls + "_" + c);
      return { label: "Escenario → componente", prompt: s.text, options: opts, answer: right, explanation: s.feedback };
    }
    return { label: "Familia → clase", prompt: "¿A qué clase pertenece la familia " + p.code + "?", options: optionsFor(p.cls, ALL_CLASSES, 4, "q" + idx), answer: p.cls, explanation: p.code + " forma parte de " + p.cls + ": " + familyInfo(p.code).desc };
  });

  function renderQuiz() {
    const el = $("#view-evaluacion");
    if (state.quizSubmitted) {
      const correct = QUIZ.filter((q, i) => state.quizAnswers[i] === q.answer).length;
      const pct = Math.round((correct / QUIZ.length) * 100);
      const wrong = QUIZ.map((q, i) => ({ q, i })).filter((x) => state.quizAnswers[x.i] !== x.q.answer);
      const shown = state.quizShowAll ? wrong : wrong.slice(0, 4);
      el.innerHTML = head("Cierre · Evaluar", "Resultado de la evaluación", "Revisa los errores y vuelve a la actividad que necesites reforzar.", "trophy") + `
        <div class="card score-panel quiz-layout">
          <div class="score-circle">${pct}%</div>
          <h3>${correct} de ${QUIZ.length} respuestas correctas</h3>
          <p style="color:var(--text-soft);margin-top:8px">${pct >= 85 ? "Dominas el catálogo: ya puedes identificar clases y familias con seguridad." : pct >= 60 ? "Buen avance. Repasa las familias que aparecen abajo y vuelve a intentarlo." : "Conviene repasar el catálogo antes de repetir el examen."}</p>
          <div class="row-actions" style="justify-content:center">
            <button class="btn btn-primary" data-action="quiz-restart">${icon("rotate")} Repetir examen</button>
            <button class="btn" data-action="nav" data-view="catalogo">Repasar catálogo</button>
          </div>
        </div>
        ${wrong.length ? `<div class="card quiz-layout" style="margin-top:16px"><p class="round-label">Para repasar · ${wrong.length} ${wrong.length === 1 ? "error" : "errores"}</p><div style="margin-top:12px;display:grid;gap:10px">${shown.map(({ q, i }) => `<div class="feedback is-warn"><strong>${i + 1}. ${esc(q.label)} — Respuesta: ${esc(q.answer)}</strong>${esc(q.explanation)}</div>`).join("")}</div>${wrong.length > 4 ? `<div class="row-actions"><button class="btn" data-action="quiz-expand">${state.quizShowAll ? "Ver menos" : "Ver todos los errores"}</button></div>` : ""}</div>` : ""}`;
      return;
    }
    const q = QUIZ[state.quizIndex];
    const ans = state.quizAnswers[state.quizIndex];
    el.innerHTML = head("Cierre · Evaluar", "Evaluación final", "Quince preguntas mixtas. Puedes avanzar y volver para cambiar tus respuestas antes de entregar.", "clipboard-check") + `
      <div class="card quiz-layout">
        <div class="quiz-meta">
          <p class="round-label">Pregunta ${state.quizIndex + 1} de ${QUIZ.length}</p>
          <div class="quiz-dots">${QUIZ.map((_, i) => `<span class="quiz-dot ${i === state.quizIndex ? "is-current" : state.quizAnswers[i] ? "is-answered" : ""}"></span>`).join("")}</div>
        </div>
        <div class="scenario-text">${esc(q.prompt)}</div>
        <p class="round-label">${esc(q.label)}</p>
        <div class="option-grid" style="margin-top:12px">${q.options.map((o) => `<button type="button" class="option ${ans === o ? "is-selected" : ""}" data-action="quiz-option" data-value="${esc(o)}"><span class="opt-code">${esc(o)}</span></button>`).join("")}</div>
        <div class="row-actions">
          <button class="btn" data-action="quiz-back" ${state.quizIndex === 0 ? "disabled" : ""}>${icon("arrow-left")} Anterior</button>
          ${state.quizIndex === QUIZ.length - 1 ? `<button class="btn btn-primary" data-action="quiz-submit" ${state.quizAnswers.every(Boolean) ? "" : "disabled"}>${icon("check")} Entregar examen</button>` : `<button class="btn btn-primary" data-action="quiz-next" ${ans ? "" : "disabled"}>Siguiente ${icon("arrow-right")}</button>`}
        </div>
      </div>`;
  }

  /* ---------- Resumen ---------- */
  function renderResumen() {
    $("#view-resumen").innerHTML = head("Cierre · Repasar", "Pares que se confunden", "Cuatro comparaciones que suelen generar dudas en el examen y en la práctica profesional.", "books") + `
      <div class="confusion-grid">${CONFUSIONS.map((c) => `<div class="card confusion-card"><h3>${esc(c.a.code)} frente a ${esc(c.b.code)}</h3><div class="compare"><div class="compare-item"><b>${esc(c.a.code)}</b><span>${esc(c.a.name)}</span><p>${esc(c.a.desc)}</p></div><div class="compare-item"><b>${esc(c.b.code)}</b><span>${esc(c.b.name)}</span><p>${esc(c.b.desc)}</p></div></div><div class="confusion-note">${icon("bulb")}<span>${esc(c.note)}</span></div></div>`).join("")}</div>
      <div class="notice" style="margin-top:18px">${icon("info-circle")}<span><strong>Regla rápida:</strong> FAU audita, FIA identifica, FPT protege al protector, FDP protege los datos del usuario y FTP crea rutas de confianza.</span></div>
      <div class="row-actions"><button class="btn btn-primary" data-action="nav" data-view="evaluacion">Ir a la evaluación ${icon("arrow-right")}</button><button class="btn" data-action="nav" data-view="catalogo">Volver al catálogo</button></div>`;
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    switch (a) {
      case "nav": go(el.dataset.view); break;
      case "theme": {
        const dark = document.documentElement.dataset.theme === "dark";
        document.documentElement.dataset.theme = dark ? "light" : "dark";
        try { localStorage.setItem(THEME_KEY, dark ? "light" : "dark"); } catch (err) { /* noop */ }
        renderTheme();
        break;
      }
      case "reset": {
        if (!window.confirm("¿Reiniciar todo el progreso guardado?")) return;
        state.done = ACTIVITIES.reduce((acc, k) => (acc[k] = false, acc), {});
        state.flipped.clear(); state.visited.clear();
        try { localStorage.removeItem(STORE_KEY); } catch (err) { /* noop */ }
        updateProgress(); renderView(); toast("Progreso reiniciado");
        break;
      }
      case "flip": {
        el.classList.toggle("is-flipped");
        state.flipped.add(el.dataset.code);
        if (state.flipped.size === CLASSES.length) markDone("conceptos");
        break;
      }
      case "concept-page":
        state.conceptPage = Math.max(0, Math.min(Math.ceil(CLASSES.length / 6) - 1, state.conceptPage + Number(el.dataset.dir)));
        renderConceptos(); break;
      case "catalog-page":
        state.catalogPage = Math.max(0, Math.min(Math.ceil(CLASSES.length / 6) - 1, state.catalogPage + Number(el.dataset.dir)));
        state.familyPage = 0; renderCatalogo(); break;
      case "family-page":
        state.familyPage = Math.max(0, state.familyPage + Number(el.dataset.dir));
        renderCatalogo(); break;
      case "class-select":
        state.catalogCode = el.dataset.code; state.familyPage = 0;
        state.visited.add(state.catalogCode);
        if (state.visited.size === CLASSES.length) markDone("catalogo");
        renderCatalogo(); break;
      case "subtab":
        state.subtab = el.dataset.tab; renderPractica(); break;
      case "blank": {
        if (state.dragChecked) return;
        const i = Number(el.dataset.i);
        if (state.dragAnswers[state.dragIndex][i]) { state.dragAnswers[state.dragIndex][i] = null; }
        state.dragSelectedBlank = i;
        renderDragWords(); break;
      }
      case "word": {
        if (state.dragChecked) return;
        const w = el.dataset.word;
        const arr = state.dragAnswers[state.dragIndex];
        let i = state.dragSelectedBlank;
        if (i === null || arr[i]) i = arr.findIndex((x) => !x);
        if (i < 0) return;
        arr[i] = w;
        state.dragSelectedBlank = null;
        renderDragWords(); break;
      }
      case "drag-check":
        state.dragChecked = true;
        if (state.dragAnswers[state.dragIndex].every((v, i) => v === DRAG_SENTENCES[state.dragIndex].answers[i])) {
          state.dragCompleted.add(state.dragIndex);
          if (state.dragCompleted.size === DRAG_SENTENCES.length) markDone("dragwords");
        }
        renderDragWords(); break;
      case "drag-next":
        state.dragIndex = Math.min(DRAG_SENTENCES.length - 1, state.dragIndex + 1);
        state.dragChecked = false; state.dragSelectedBlank = null;
        if (state.dragCompleted.size === DRAG_SENTENCES.length) { state.subtab = "map"; renderPractica(); }
        else renderDragWords(); break;
      case "drag-reset":
        state.dragAnswers[state.dragIndex] = [null, null];
        state.dragChecked = false; state.dragSelectedBlank = null; renderDragWords(); break;
      case "match-select": {
        if (state.matchChecked) return;
        const i = Number(el.dataset.i);
        state.matchSelected = state.matchSelected === i ? null : i;
        renderMatch(); break;
      }
      case "match-target": {
        if (state.matchSelected === null || state.matchChecked) return;
        state.matchAssignments[state.matchSelected] = el.dataset.cls;
        state.matchSelected = null;
        renderMatch(); break;
      }
      case "match-check": {
        state.matchChecked = true;
        const start = state.matchPage * 6;
        KEYWORD_MATCH.slice(start, start + 6).forEach((it, i) => {
          const gi = start + i;
          if (state.matchAssignments[gi] === it.cls) state.matchCompleted.add(gi);
          else state.matchCompleted.delete(gi);
        });
        if (state.matchCompleted.size === KEYWORD_MATCH.length) markDone("match");
        renderMatch(); break;
      }
      case "match-page":
        state.matchPage = state.matchPage === 0 ? 1 : 0;
        state.matchChecked = false; state.matchSelected = null; renderMatch(); break;
      case "match-reset":
        state.matchAssignments = {}; state.matchChecked = false; state.matchSelected = null; renderMatch(); break;
      case "map-place": {
        if (state.mapChecked) return;
        const code = el.dataset.code;
        if (!state.mapPlaced.includes(code)) state.mapPlaced.push(code);
        renderMap(); break;
      }
      case "map-remove":
        if (state.mapChecked) return;
        state.mapPlaced = state.mapPlaced.filter((c) => c !== el.dataset.code);
        renderMap(); break;
      case "map-check": {
        state.mapChecked = true;
        const round = MAP_ROUNDS[state.mapRound];
        const correct = classByCode(round.cls).families.map((x) => x.code);
        if (state.mapPlaced.length === correct.length && state.mapPlaced.every((c) => correct.includes(c))) {
          state.mapCompleted.add(round.cls);
          if (state.mapCompleted.size === MAP_ROUNDS.length) markDone("map");
          else toast("Ronda completada");
        }
        renderMap(); break;
      }
      case "map-next":
        if (state.mapRound === MAP_ROUNDS.length - 1) { state.subtab = "scenarios"; renderPractica(); }
        else { state.mapRound += 1; state.mapPlaced = []; state.mapChecked = false; renderMap(); }
        break;
      case "map-reset":
        state.mapPlaced = []; state.mapChecked = false; renderMap(); break;
      case "sc-class":
        state.scClass = el.dataset.value; state.scFam = null; state.scChecked = false; renderScenarios(); break;
      case "sc-family":
        state.scFam = el.dataset.value; renderScenarios(); break;
      case "sc-change":
        state.scClass = null; state.scFam = null; state.scChecked = false; renderScenarios(); break;
      case "sc-check": {
        state.scChecked = true;
        const s = SCENARIOS[state.scIndex];
        if (state.scClass === s.cls && state.scFam === s.fam) {
          state.scCompleted.add(state.scIndex);
          if (state.scCompleted.size === SCENARIOS.length) markDone("scenarios");
          else toast("Escenario resuelto");
        }
        renderScenarios(); break;
      }
      case "sc-reset":
        state.scClass = null; state.scFam = null; state.scChecked = false; renderScenarios(); break;
      case "sc-next":
        if (state.scIndex === SCENARIOS.length - 1) { go("evaluacion"); }
        else { state.scIndex += 1; state.scClass = null; state.scFam = null; state.scChecked = false; renderScenarios(); }
        break;
      case "quiz-option":
        state.quizAnswers[state.quizIndex] = el.dataset.value; renderQuiz(); break;
      case "quiz-next":
        if (state.quizIndex < QUIZ.length - 1) { state.quizIndex += 1; renderQuiz(); }
        break;
      case "quiz-back":
        if (state.quizIndex > 0) { state.quizIndex -= 1; renderQuiz(); }
        break;
      case "quiz-submit":
        state.quizSubmitted = true; markDone("evaluacion"); renderQuiz(); break;
      case "quiz-restart":
        state.quizSubmitted = false; state.quizIndex = 0; state.quizAnswers = Array(QUIZ.length).fill(null); state.quizShowAll = false; renderQuiz(); break;
      case "quiz-expand":
        state.quizShowAll = !state.quizShowAll; renderQuiz(); break;
    }
  });

  /* --- Arrastrar y soltar (con alternativa por clic) --- */
  document.addEventListener("dragstart", (e) => {
    const el = e.target.closest("[data-drag]");
    if (!el) return;
    let payload = null;
    if (el.dataset.drag === "word") payload = { type: "word", value: el.dataset.word };
    if (el.dataset.drag === "keyword") payload = { type: "keyword", index: Number(el.dataset.index) };
    if (el.dataset.drag === "family") payload = { type: "family", code: el.dataset.code };
    if (!payload) return;
    try { e.dataTransfer.setData("text/plain", JSON.stringify(payload)); e.dataTransfer.effectAllowed = "move"; } catch (err) { /* noop */ }
  });
  document.addEventListener("dragover", (e) => {
    const zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    zone.classList.add("is-over");
  });
  document.addEventListener("dragleave", (e) => {
    const zone = e.target.closest("[data-drop]");
    if (zone) zone.classList.remove("is-over");
  });
  document.addEventListener("drop", (e) => {
    const zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove("is-over");
    let data;
    try { data = JSON.parse(e.dataTransfer.getData("text/plain")); } catch (err) { return; }
    if (!data) return;
    if (zone.dataset.drop === "blank" && data.type === "word" && !state.dragChecked) {
      const arr = state.dragAnswers[state.dragIndex];
      arr[Number(zone.dataset.i)] = data.value;
      state.dragSelectedBlank = null; renderDragWords();
    }
    if (zone.dataset.drop === "target" && data.type === "keyword" && !state.matchChecked) {
      state.matchAssignments[data.index] = zone.dataset.cls;
      state.matchSelected = null; renderMatch();
    }
    if (zone.dataset.drop === "zone" && data.type === "family" && !state.mapChecked) {
      if (!state.mapPlaced.includes(data.code)) state.mapPlaced.push(data.code);
      renderMap();
    }
  });

  /* ---------- Arranque ---------- */
  const savedTheme = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
  document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
  $("#resetProgress").dataset.action = "reset";
  $("#themeToggle").dataset.action = "theme";
  renderTheme();
  renderNav();
  updateProgress();
  renderView();
})();
