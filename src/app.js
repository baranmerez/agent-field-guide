/* ================================================================
   Gezinme: seviye sekmeleri, konu sekmeleri, ilerleme, sözlük.
   URL biçimi: #L3/2  (seviye 3, konu 2; konu 1'den başlar)
   ================================================================ */
(function(){
"use strict";
const { $, $$, h, store, initWidgetsIn, gloss, t, LANG } = Edu;
const ACC = { model:"var(--model)", harness:"var(--harness)", ctx:"var(--ctx)", tool:"var(--tool)", risk:"var(--risk)" };
const levels = $$(".level");
const ltabs = $("#ltabs");
const seen = new Set(store.get("seen", []));
const total = $$(".lesson").length;

/* ---- kahraman alanı ve konu sekmeleri seviye başına bir kez kurulur ---- */
levels.forEach((lv, li) => {
  const no = lv.dataset.no, lessons = $$(":scope > .lesson", lv);
  lv.id = "L" + no;
  if (!$(":scope > .lvl-hero", lv)){
    const hero = h("header", {class:"lvl-hero", "data-no": no === "G" ? "" : no},
      h("p", {class:"lvl-kicker"}, no === "G" ? t("start") : t("level") + " " + no),
      h("h1", null, lv.dataset.title),
      lv.dataset.lede ? h("p", {class:"lede"}, lv.dataset.lede) : null,
      h("div", {class:"lvl-meta"},
        h("span", null, t("lessons", {n: lessons.length})),
        lv.dataset.time ? h("span", null, "≈ " + lv.dataset.time) : null,
        lv.dataset.for ? h("span", null, lv.dataset.for) : null));
    lv.prepend(hero);
  }
  const bar = h("div", {class:"stabs", role:"tablist", "aria-label":t("topics")});
  const prog = h("i");
  lessons.forEach((ls, k) => {
    ls.id = lv.id + "-" + (k+1);
    ls.setAttribute("role", "tabpanel");
    const b = h("button", {class:"stab", role:"tab", type:"button", "aria-controls": ls.id, "data-k": k},
      h("span", {class:"i"}, String(k+1)), ls.dataset.tab);
    b.addEventListener("click", () => go(li, k, true));
    bar.append(b);
  });
  const wrap = h("div", {class:"stabs-wrap"}, bar, h("div", {class:"stab-bar"}, prog));
  lessons[0].before(wrap);
  lv.append(h("nav", {class:"pager", "aria-label":t("pagerAria")}, h("button", {type:"button", class:"prev"}), h("button", {type:"button", class:"next"})));

  const tab = h("button", {class:"ltab", role:"tab", type:"button", style:{"--tc": ACC[lv.dataset.accent] || "var(--ink)"}, title: lv.dataset.title},
    h("span", {class:"n"}, h("span", null, no === "G" ? "★" : no)), h("span", {class:"lt"}, lv.dataset.short || lv.dataset.title));
  tab.addEventListener("click", () => {
    const last = store.get("last:" + lv.id, 0);
    go(li, last, true);
  });
  ltabs.append(tab);
});

/* Başlarken kahramanına kayan token şeridi (iki dilde de, seviye dosyasından bağımsız) */
const gHero = $(".level[data-no=\"G\"] > .lvl-hero");
if (gHero && !$("[data-anim]", gHero)){ gHero.append(h("div", {"data-anim":"token-stream"})); initWidgetsIn(gHero); }

function labelOf(li, k){
  const lv = levels[li], ls = $$(":scope > .lesson", lv)[k];
  return (lv.dataset.no === "G" ? "" : lv.dataset.no + "." + (k+1) + " · ") + ls.dataset.tab;
}
function neighbour(li, k, dir){
  const n = $$(":scope > .lesson", levels[li]).length;
  if (dir > 0){ if (k+1 < n) return [li, k+1]; if (li+1 < levels.length) return [li+1, 0]; return null; }
  if (k > 0) return [li, k-1];
  if (li > 0) return [li-1, $$(":scope > .lesson", levels[li-1]).length - 1];
  return null;
}

function updateProgress(){
  const p = Math.round(seen.size / total * 100);
  $("#progRing").style.setProperty("--p", p);
  $("#progTxt").textContent = t("pct", {p});
  $("#progStat").innerHTML = "<b>" + t("pct", {p}) + "</b> · " + t("progStat", {done: seen.size, total});
  $("#progMeter").style.width = p + "%";
  levels.forEach((lv, li) => {
    const ids = $$(":scope > .lesson", lv).map(x => x.id);
    $$(".ltab", ltabs)[li].classList.toggle("done", lv.dataset.no !== "G" && ids.every(id => seen.has(id)));
    $$(".stab", lv).forEach((b, k) => b.classList.toggle("seen", seen.has(ids[k])));
  });
}

let cur = [-1, -1];
function show(li, k, scroll){
  li = Math.max(0, Math.min(levels.length-1, li));
  const lv = levels[li], lessons = $$(":scope > .lesson", lv);
  k = Math.max(0, Math.min(lessons.length-1, k));
  levels.forEach((x, j) => x.classList.toggle("active", j === li));
  $$(".ltab", ltabs).forEach((t, j) => t.setAttribute("aria-selected", j === li ? "true" : "false"));
  const active = $$(".ltab", ltabs)[li];
  if (active && active.scrollIntoView) active.scrollIntoView({inline:"nearest", block:"nearest"});
  lessons.forEach((ls, j) => ls.classList.toggle("active", j === k));
  $$(".stab", lv).forEach((b, j) => { b.setAttribute("aria-selected", j === k ? "true" : "false"); b.tabIndex = j === k ? 0 : -1; });
  const sb = $$(".stab", lv)[k]; if (sb && sb.scrollIntoView) sb.scrollIntoView({inline:"nearest", block:"nearest"});
  $(".stab-bar i", lv).style.width = ((k+1) / lessons.length * 100) + "%";

  const prev = $(".pager .prev", lv), next = $(".pager .next", lv);
  const pn = neighbour(li, k, -1), nn = neighbour(li, k, 1);
  prev.style.visibility = pn ? "visible" : "hidden";
  next.style.visibility = nn ? "visible" : "hidden";
  if (pn){ prev.innerHTML = "<small>" + t("prev") + "</small><span></span>"; prev.lastChild.textContent = labelOf(...pn); prev.onclick = () => go(...pn, true); }
  if (nn){ next.innerHTML = "<small>" + t("next") + "</small><span></span>"; next.lastChild.textContent = labelOf(...nn); next.onclick = () => go(...nn, true); }

  const ls = lessons[k];
  seen.add(ls.id); store.set("seen", [...seen]); store.set("last:" + lv.id, k); store.set("pos", [li, k]);
  updateProgress();
  if (lv.dataset.no === "G" && !lv.dataset.eqAnim){ lv.dataset.eqAnim = "1"; const eq = $(".eq", lv); if (eq) eq.classList.add("anim"); }
  initWidgetsIn(ls);
  document.title = (lv.dataset.no === "G" ? "" : t("level") + " " + lv.dataset.no + ": " + ls.dataset.tab + " · ") + t("brand");
  const levelChanged = cur[0] !== li;
  cur = [li, k];
  if (scroll){
    if (levelChanged) window.scrollTo(0, 0);
    else {
      const hero = lv.querySelector(".lvl-hero");
      const anchor = hero.offsetTop + hero.offsetHeight - topH() + 12;
      if (window.scrollY > anchor) window.scrollTo(0, anchor);
    }
  }
}
function go(li, k, scroll){
  const id = "#L" + levels[li].dataset.no + "/" + (k+1);
  if (location.hash !== id) history.pushState(null, "", id);
  show(li, k, scroll);
}
function fromHash(){
  const m = location.hash.match(/^#L([0-9]+|G)(?:\/(\d+))?/);
  if (!m) return null;
  const li = levels.findIndex(x => x.dataset.no === m[1]);
  return li < 0 ? null : [li, (parseInt(m[2] || "1", 10) - 1)];
}
function topH(){ return $(".top").getBoundingClientRect().height; }
function setTopVar(){ document.documentElement.style.setProperty("--top-h", topH() + "px"); }
window.addEventListener("resize", setTopVar);
window.addEventListener("popstate", () => { const p = fromHash(); if (p) show(p[0], p[1], true); });

/* klavye: sağ/sol ok konu değiştirir (form alanlarında değil) */
document.addEventListener("keydown", e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target;
  if (t && (t.closest("input,textarea,select,[contenteditable]"))) return;
  if (e.key === "ArrowRight" && t.closest && t.closest(".stabs")) { const nn = neighbour(cur[0], cur[1], 1); if (nn && nn[0] === cur[0]) { go(...nn, false); $$(".stab", levels[cur[0]])[cur[1]].focus(); } e.preventDefault(); }
  if (e.key === "ArrowLeft" && t.closest && t.closest(".stabs")) { const pn = neighbour(cur[0], cur[1], -1); if (pn && pn[0] === cur[0]) { go(...pn, false); $$(".stab", levels[cur[0]])[cur[1]].focus(); } e.preventDefault(); }
});

/* giriş sayfasındaki seviye haritası: [data-goto="3"] */
document.addEventListener("click", e => {
  const g = e.target.closest("[data-goto]");
  if (!g) return;
  e.preventDefault();
  const [lvNo, k] = g.dataset.goto.split("/");
  const li = levels.findIndex(x => x.dataset.no === lvNo);
  if (li >= 0) go(li, k ? parseInt(k, 10) - 1 : 0, true);
});

/* ---- dış bağlantılar yeni sekmede açılır (kaldığın konu kaybolmasın) ---- */
$$('a[href^="http"]').forEach(a => { a.target = "_blank"; a.rel = "noopener noreferrer"; });

/* ---- kod blokları: kopyala düğmesi ---- */
$$("pre").forEach(pre => {
  if (pre.closest(".fig") && !pre.dataset.copy) return;
  const b = h("button", {class:"copy-btn", type:"button"}, t("copy"));
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(pre.querySelector("code") ? pre.querySelector("code").innerText : pre.innerText); b.textContent = t("copied"); }
    catch(e){ b.textContent = t("copyFail"); }
    setTimeout(() => b.textContent = t("copy"), 1400);
  });
  pre.append(b);
});

/* ---- sözlük: açılır kutu + çekmece ---- */
const pop = h("div", {class:"gpop", role:"tooltip"});
document.body.append(pop);
function keyOf(el){ return (el.dataset.g || el.textContent).trim().toLocaleLowerCase(LANG); }
function findTerm(key){
  if (gloss[key]) return [key, gloss[key]];
  const hit = Object.keys(gloss).find(t => t.toLocaleLowerCase(LANG) === key);
  return hit ? [hit, gloss[hit]] : null;
}
function showPop(el){
  const t = findTerm(keyOf(el)); if (!t) return;
  pop.innerHTML = ""; pop.append(h("b", null, t[0]), h("span", null, t[1]));
  const r = el.getBoundingClientRect();
  pop.style.left = Math.max(8, Math.min(window.innerWidth - 330, r.left)) + "px";
  pop.style.top = (r.bottom + 8 + 160 > window.innerHeight ? r.top - pop.offsetHeight - 8 : r.bottom + 8) + "px";
  pop.classList.add("on");
}
$$(".g").forEach(el => { el.tabIndex = 0; });
document.addEventListener("mouseover", e => { const g = e.target.closest && e.target.closest(".g"); if (g) showPop(g); });
document.addEventListener("mouseout", e => { if (e.target.closest && e.target.closest(".g")) pop.classList.remove("on"); });
document.addEventListener("focusin", e => { if (e.target.classList && e.target.classList.contains("g")) showPop(e.target); });
document.addEventListener("focusout", () => pop.classList.remove("on"));
window.addEventListener("scroll", () => pop.classList.remove("on"), {passive:true});

const drawer = $("#gloss"), scrim = $("#scrim"), gsearch = $("#glossSearch"), glist = $("#glossList");
function renderGloss(){
  const q = gsearch.value.trim().toLocaleLowerCase(LANG);
  glist.innerHTML = "";
  Object.keys(gloss).sort((a,b) => a.localeCompare(b, LANG)).forEach(k => {
    if (q && !(k.toLocaleLowerCase(LANG).includes(q) || gloss[k].toLocaleLowerCase(LANG).includes(q))) return;
    glist.append(h("div", {class:"gl-item"}, h("b", null, k), gloss[k]));
  });
  if (!glist.children.length) glist.append(h("p", {class:"muted"}, t("noMatch")));
}
function openGloss(o){ drawer.classList.toggle("open", o); scrim.classList.toggle("on", o); drawer.setAttribute("aria-hidden", o ? "false" : "true"); if (o){ renderGloss(); gsearch.focus(); } }
$("#glossBtn").addEventListener("click", () => openGloss(true));
$("#glossClose").addEventListener("click", () => openGloss(false));
scrim.addEventListener("click", () => openGloss(false));
gsearch.addEventListener("input", renderGloss);
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) openGloss(false); });

/* ---- üst çubuk panelleri (ilerleme, görünüm) ---- */
const root = document.documentElement;
const panels = [["#progBtn", "#progPanel"], ["#themeBtn", "#lookPanel"]].map(([b, p]) => [$(b), $(p)]);
function closePanels(except){
  panels.forEach(([b, p]) => { if (p !== except){ p.hidden = true; b.setAttribute("aria-expanded", "false"); } });
}
panels.forEach(([b, p]) => {
  b.addEventListener("click", e => {
    e.stopPropagation();
    const open = p.hidden;
    closePanels(p);
    p.hidden = !open; b.setAttribute("aria-expanded", open ? "true" : "false");
    if (open){
      p.style.top = (b.getBoundingClientRect().bottom + 8) + "px";
      const f = p.querySelector("button[aria-pressed='true'], button"); if (f) f.focus({preventScroll:true});
    }
  });
  p.addEventListener("click", e => e.stopPropagation());
});
document.addEventListener("click", () => closePanels(null));
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  const open = panels.find(([, p]) => !p.hidden);
  if (open){ closePanels(null); open[0].focus(); }
});

/* İlerleme sıfırlama: iki adımlı onay, tarayıcı penceresi açmadan. */
const resetBtn = $("#progReset"), progMsg = $("#progMsg");
let armed = false, armTimer = null;
resetBtn.addEventListener("click", () => {
  if (!armed){
    armed = true; resetBtn.textContent = t("progConfirm"); resetBtn.classList.remove("ghost");
    clearTimeout(armTimer); armTimer = setTimeout(disarm, 5000);
    return;
  }
  seen.clear(); store.set("seen", []);
  levels.forEach(lv => store.set("last:" + lv.id, 0));
  if (cur[0] >= 0){ const ls = $$(":scope > .lesson", levels[cur[0]])[cur[1]]; seen.add(ls.id); store.set("seen", [...seen]); }
  updateProgress(); disarm();
  progMsg.textContent = t("progDone");
  setTimeout(() => progMsg.textContent = "", 2500);
});
function disarm(){ armed = false; resetBtn.textContent = t("progReset"); resetBtn.classList.add("ghost"); }

/* Temalar: değer = data-theme; "auto" sistem tercihini izler. */
const T_THEMES = t("themes");
const THEMES = [
  ["auto", T_THEMES.auto, null],
  ["light", T_THEMES.light, ["#F5F6FA", "#141B27"]],
  ["sepia", T_THEMES.sepia, ["#F4ECD8", "#3B2F22"]],
  ["lavender", T_THEMES.lavender, ["#F6F3FB", "#221B33"]],
  ["mint", T_THEMES.mint, ["#EEF6F2", "#16271F"]],
  ["dark", T_THEMES.dark, ["#0F131A", "#E7EAF0"]],
  ["nordic", T_THEMES.nordic, ["#1F2430", "#E5E9F0"]],
  ["forest", T_THEMES.forest, ["#121A16", "#E3ECE6"]],
  ["coffee", T_THEMES.coffee, ["#1C1714", "#EEE4D8"]],
  ["oled", T_THEMES.oled, ["#000000", "#E8E8EC"]],
  ["contrast", T_THEMES.contrast, ["#000000", "#FFFFFF"]]
];
const DOTS = { light:["#8A2C9C","#0B7A70","#B06F00","#2456C9"], sepia:["#8B3A8F","#2F6F5E","#9A5C06","#2F5596"], lavender:["#7E3AB5","#11786F","#A0600A","#3A55C9"], mint:["#83338F","#0B6E62","#9A5F00","#245CB0"], dark:["#D58BE6","#3CC8BA","#EDB24B","#7EA6FF"], nordic:["#C89BE8","#7FD1C3","#EBCB8B","#88B4F5"], forest:["#D49BE0","#5FD3B5","#E7C068","#8FB8FF"], coffee:["#DA9AD8","#6FCDB8","#F0B860","#92B2F0"], oled:["#DB8EF0","#45D3C4","#F2B84E","#82A9FF"], contrast:["#F0A6FF","#3FF0DD","#FFD23F","#A8C8FF"] };
const grid = $("#themeGrid");
THEMES.forEach(([v, name, pv]) => {
  const prev = pv
    ? h("span", {class:"pv", style:{background: pv[0], color: pv[1]}}, "Aa", h("span", {class:"dots"}, DOTS[v].map(c => h("i", {style:{background:c}}))))
    : h("span", {class:"pv", style:{background:"linear-gradient(135deg,#F5F6FA 50%,#0F131A 50%)", color:"#888"}}, "Aa", h("span", {class:"dots"}, h("i", {style:{background:"#8A2C9C"}}), h("i", {style:{background:"#3CC8BA"}})));
  const b = h("button", {class:"theme-sw", type:"button", "data-v": v, "aria-pressed":"false", title: name}, prev, h("span", {class:"nm"}, name));
  b.addEventListener("click", () => applyTheme(v));
  grid.append(b);
});
function applyTheme(v){
  if (v === "auto"){ delete root.dataset.theme; store.set("theme", null); }
  else { root.dataset.theme = v; store.set("theme", v); }
  $$(".theme-sw", grid).forEach(x => x.setAttribute("aria-pressed", x.dataset.v === v ? "true" : "false"));
}
applyTheme(store.get("theme", null) || "auto");

/* Yazı tipi */
$$("#fontSeg button").forEach(b => b.addEventListener("click", () => applyFont(b.dataset.v)));
function applyFont(v){
  if (v === "sans") delete root.dataset.font; else root.dataset.font = v;
  store.set("font", v === "sans" ? null : v);
  $$("#fontSeg button").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === v ? "true" : "false"));
}
applyFont(store.get("font", null) || "sans");

/* Yazı boyutu: %85 – %130, %5 adım */
let fs = store.get("fs", 1) || 1;
function applyFs(v){
  fs = Math.round(Math.max(.85, Math.min(1.3, v)) * 100) / 100;
  if (fs === 1){ root.style.removeProperty("--fs"); store.set("fs", null); } else { root.style.setProperty("--fs", fs); store.set("fs", fs); }
  $("#fsVal").textContent = t("pct", {p: Math.round(fs * 100)});
  $("#fsDown").disabled = fs <= .85; $("#fsUp").disabled = fs >= 1.3;
  setTopVar();
}
$("#fsDown").addEventListener("click", () => applyFs(fs - .05));
$("#fsUp").addEventListener("click", () => applyFs(fs + .05));
$("#fsVal").addEventListener("click", () => applyFs(1));
applyFs(fs);

/* ---- dil düğmesi: aynı konunun diğer dildeki karşılığına geçer ---- */
const langBtn = $("#langBtn");
if (langBtn){
  const base = langBtn.getAttribute("href");
  const sync = () => { langBtn.setAttribute("href", base + location.hash); };
  ["mouseenter", "focus", "touchstart"].forEach(ev => langBtn.addEventListener(ev, sync, {passive:true}));
  langBtn.addEventListener("click", () => { sync(); store.set("lang", langBtn.getAttribute("hreflang")); });
}
store.set("lang", LANG);

/* ---- başlangıç ---- */
setTopVar();
const start = fromHash() || store.get("pos", null) || [0, 0];
show(start[0], start[1], false);
if (!fromHash()) history.replaceState(null, "", "#L" + levels[cur[0]].dataset.no + "/" + (cur[1]+1));
})();
