/* ================================================================
   Edu: eğitim setinin ortak çalışma zamanı.
   Seviye dosyaları widget'larını Edu.widget(...) ile kaydeder;
   widget, ait olduğu konu sekmesi ilk kez açıldığında başlatılır.
   ================================================================ */
(function(){
"use strict";
const RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

function h(tag, props, ...kids){
  const el = document.createElement(tag);
  if (props) for (const [k,v] of Object.entries(props)){
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()){
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const sleep = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 30) : ms));

/* İptal edilebilir çalıştırma: aynı widget'ta yeni animasyon eskisini durdurur. */
function runner(){
  let gen = 0;
  return {
    start(){ gen++; const my = gen; return () => my !== gen; },
    stop(){ gen++; }
  };
}

async function typewrite(el, text, opt={}){
  const speed = opt.speed ?? 14, cancelled = opt.cancelled || (()=>false);
  if (RM || opt.instant){ el.textContent = text; return; }
  el.textContent = "";
  for (let i=0; i<text.length; i++){
    if (cancelled()) return;
    el.textContent += text[i];
    if (text[i] !== " ") await sleep(speed);
  }
}

/* JSON'u renklendirilmiş HTML olarak döndürür. hl: vurgulanacak anahtar adları. */
function json(obj, opt={}){
  const hl = new Set(opt.hl || []);
  const ind = n => "  ".repeat(n);
  const val = (v, d) => {
    if (v === null) return '<span class="z">null</span>';
    if (typeof v === "string") return '<span class="s">"' + esc(v) + '"</span>';
    if (typeof v === "number") return '<span class="n">' + v + '</span>';
    if (typeof v === "boolean") return '<span class="b">' + v + '</span>';
    if (Array.isArray(v)){
      if (!v.length) return "[]";
      return "[\n" + v.map(x => ind(d+1) + val(x, d+1)).join(",\n") + "\n" + ind(d) + "]";
    }
    const ks = Object.keys(v);
    if (!ks.length) return "{}";
    return "{\n" + ks.map(k => {
      const key = '<span class="k">"' + esc(k) + '"</span>';
      const line = ind(d+1) + key + ": " + val(v[k], d+1);
      return hl.has(k) ? '<span class="hl">' + line + '</span>' : line;
    }).join(",\n") + "\n" + ind(d) + "}";
  };
  return val(obj, 0);
}

/* Yaklaşık tokenizer: öğretim amaçlı. Gerçek BPE değil ama bölünme mantığı benzer. */
const COMMON = new Set(("the of and to in is that for it as with was on be by this are or from at an not have but you all can will one which their has more if its what about when there so out up no them would how into my than then do some could these two may other time only new like just over also any after most use our first well way even want because good very through where much your should those such here still being both each between under never same last own while might great old year around however another back without against again few off system data model code file function test user value type error token context agent tool").split(" "));
function tokenize(text){
  const out = [];
  const parts = text.match(/\s*[\p{L}\p{M}]+|\s*\d|\s*[^\s\p{L}\p{M}\d]|\s+/gu) || [];
  for (const p of parts){
    const lead = p.match(/^\s*/)[0], w = p.slice(lead.length);
    if (!/[\p{L}]/u.test(w)){ out.push(p); continue; }
    const low = w.toLocaleLowerCase("tr");
    if (w.length <= 3 || COMMON.has(low)){ out.push(p); continue; }
    // ASCII ve sık görünen İngilizce kökler daha uzun parçalar tutar; Türkçe ekler ve
    // ASCII dışı harfler (ç, ğ, ı, ö, ş, ü) daha sık bölünür.
    const ascii = /^[A-Za-z]+$/.test(w);
    const chunk = ascii ? 6 : 4;
    let i = 0, first = true;
    while (i < w.length){
      let n = Math.min(chunk, w.length - i);
      const piece = w.slice(i, i+n);
      if (!ascii && /[çğıöşüÇĞİÖŞÜ]/.test(piece) && n > 2) n = Math.max(2, piece.search(/[çğıöşüÇĞİÖŞÜ]/) + 1) ;
      out.push((first ? lead : "") + w.slice(i, i+n));
      i += n; first = false;
    }
  }
  return out;
}

/* Basit, güvenli localStorage sarmalayıcı. */
const store = {
  get(k, d){ try{ const v = localStorage.getItem("egitim:"+k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("egitim:"+k, JSON.stringify(v)); }catch(e){} }
};

/* Adım adım oynatıcı.
   Edu.stepper(container, { steps:[...], render(i, step, ctx), auto: 1800, loop:false, labels:{...} })
   container içine kontrol çubuğu + .stp-body ekler; render her adımda çağrılır. */
function stepper(root, cfg){
  const steps = cfg.steps, n = steps.length, auto = cfg.auto ?? 1800;
  const body = h("div", {class:"stp-body"});
  const prev = h("button", {class:"btn ghost sm", type:"button"}, "← Geri");
  const play = h("button", {class:"btn sm", type:"button"}, "▶ Oynat");
  const next = h("button", {class:"btn ghost sm", type:"button"}, "İleri →");
  const reset = h("button", {class:"btn ghost sm", type:"button"}, "↺ Baştan");
  const dots = h("div", {class:"stp-dots", role:"group", "aria-label":"Adımlar"});
  const count = h("span", {class:"stp-count"});
  const head = h("div", {class:"stp-head"}, prev, play, next, reset, dots, count);
  if (cfg.controlsFirst === false){ root.append(body, head); } else { root.append(head, body); }
  steps.forEach((s, k) => dots.append(h("button", {type:"button", "aria-label":"Adım "+(k+1), onclick:()=>{ stopPlay(); go(k); }})));
  let i = -1, timer = null;
  function go(k){
    i = Math.max(0, Math.min(n-1, k));
    $$("button", dots).forEach((d, j) => { d.classList.toggle("on", j===i); d.classList.toggle("past", j<i); });
    count.textContent = (i+1) + " / " + n;
    prev.disabled = i === 0; next.disabled = i === n-1;
    cfg.render(i, steps[i], {body, root});
  }
  function stopPlay(){ clearInterval(timer); timer = null; play.textContent = "▶ Oynat"; }
  function startPlay(){
    if (i >= n-1) go(0);
    play.textContent = "❚❚ Durdur";
    timer = setInterval(() => { if (i >= n-1){ if (cfg.loop) go(0); else stopPlay(); } else go(i+1); }, RM ? Math.max(auto, 2500) : auto);
  }
  prev.onclick = () => { stopPlay(); go(i-1); };
  next.onclick = () => { stopPlay(); go(i+1); };
  reset.onclick = () => { stopPlay(); go(0); };
  play.onclick = () => timer ? stopPlay() : startPlay();
  go(0);
  return { go, get index(){ return i; }, stop: stopPlay, play: startPlay };
}

/* Segment buton grubu: Edu.seg(el, onChange) — el içindeki button[data-v] */
function seg(el, onChange){
  const bs = $$("button", el);
  bs.forEach(b => b.addEventListener("click", () => {
    bs.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    onChange(b.dataset.v, b);
  }));
  const init = bs.find(b => b.getAttribute("aria-pressed") === "true") || bs[0];
  if (init){ bs.forEach(x => x.setAttribute("aria-pressed", x === init ? "true" : "false")); onChange(init.dataset.v, init); }
}

/* ---------------- widget kaydı ---------------- */
const widgets = {};
function widget(name, init){ widgets[name] = init; }
function initWidgetsIn(scope){
  $$("[data-widget]", scope).forEach(el => {
    if (el.dataset.ready) return;
    const fn = widgets[el.dataset.widget];
    if (!fn) return;
    el.dataset.ready = "1";
    try { fn(el); } catch(e){ console.error("widget " + el.dataset.widget, e); el.append(h("p", {class:"hint"}, "Bu etkileşim başlatılamadı: " + e.message)); }
  });
}

/* ---------------- sözlük ---------------- */
const gloss = {};
/* Aynı terim birden çok seviyede tanımlanırsa ilk tanım (konunun öğretildiği yer) kalır. */
function glossary(map){ for (const [k, v] of Object.entries(map)) if (!(k in gloss)) gloss[k] = v; }

window.Edu = { $, $$, h, esc, sleep, RM, runner, typewrite, json, tokenize, store, stepper, seg, widget, glossary, gloss, initWidgetsIn };
})();
