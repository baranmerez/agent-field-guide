/* ================================================================
   Ortak animasyonlar (seviye dosyalarından bağımsız, iki dilde aynı).
   <div data-anim="agent-loop"></div>    etkileşimli agent döngüsü
   <div data-anim="token-stream"></div>  kayan token şeridi
   Metinler src/i18n.json'dan gelir.
   ================================================================ */
(function(){
"use strict";
const { h, t, RM, widget } = Edu;
const NS = "http://www.w3.org/2000/svg";
const svg = (tag, attrs, ...kids) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v); kids.forEach(k => el.append(k)); return el; };
const txt = (attrs, s) => svg("text", attrs, document.createTextNode(s));

/* Ekranda görünmüyorsa ya da sekme gizliyse animasyonu duraklatır. */
function whenVisible(el, cb){
  let vis = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; cb(vis && !document.hidden); }).observe(el);
  document.addEventListener("visibilitychange", () => cb(vis && !document.hidden));
}

widget("anim:token-stream", el => {
  const toks = t("tokenStream");
  const list = Array.isArray(toks) ? toks : [];
  const track = h("div", {class:"tok-track", "aria-hidden":"true"});
  for (let r = 0; r < 4; r++) list.forEach((x, i) => track.append(h("span", {class:"tok-chip" + (i % 2 ? " alt" : "")}, x)));
  el.classList.add("tok-stream");
  el.append(track, h("span", {class:"tok-cursor", "aria-hidden":"true"}));
  whenVisible(el, on => { track.style.animationPlayState = on ? "running" : "paused"; });
});

widget("anim:agent-loop", el => {
  el.classList.add("loop-anim");
  const box = (cls, x, y, w, title, sub) => {
    const g = svg("g", {class:"lb " + cls});
    g.append(svg("rect", {x, y, width:w, height:62, rx:12}), txt({class:"lt", x:x+18, y:y+27}, title), txt({class:"ls", x:x+18, y:y+48}, sub));
    return g;
  };
  const path = svg("path", {class:"lp", d:"M190 93 H760 C800 93 830 120 830 150 C830 182 805 200 770 200 H420 C385 200 350 170 350 124"});
  const boxes = [
    box("u", 40, 62, 150, t("loopUser"), t("loopUserSub")),
    box("m", 270, 62, 160, "Model", t("loopModelSub")),
    box("c", 495, 62, 150, "tool_use", t("loopToolSub")),
    box("h", 690, 62, 170, "Harness", t("loopHarnessSub")),
    box("c", 560, 169, 170, "tool_result", t("loopResultSub"))
  ];
  const dot = svg("circle", {class:"ld", r:8, cx:190, cy:93});
  const code = svg("g", {class:"lc"}, txt({x:40, y:168}, "while (stop_reason == \"tool_use\") {"), txt({x:56, y:190}, t("loopCode")), txt({x:40, y:212}, "}"));
  const root = svg("svg", {viewBox:"0 0 900 250", role:"img", "aria-label": t("loopTitle")}, path, ...boxes, code, dot);
  const cap = h("div", {class:"panel live loop-cap", "aria-live":"polite"});
  const play = h("button", {class:"btn sm", type:"button"});
  const next = h("button", {class:"btn ghost sm", type:"button"}, t("loopStep"));
  const restart = h("button", {class:"btn ghost sm", type:"button"}, t("restart"));
  // Başlık yazılmamışsa dil dosyasından gelir; böylece işaretleme iki dilde de aynı kalır.
  if (!el.querySelector(".fig-title")) el.append(h("p", {class:"fig-title"}, t("loopTitle")), h("p", {class:"fig-cap"}, t("loopCap")));
  el.append(h("div", {class:"lsv"}, root), h("div", {class:"ctrl"}, play, next, restart), cap);

  // Durakların yol üzerindeki uzunlukları: kutu merkezine en yakın örnek nokta.
  const L = path.getTotalLength();
  const samples = Array.from({length: 600}, (_, i) => { const p = path.getPointAtLength(L * i / 599); return [p.x, p.y, L * i / 599]; });
  const near = (x, y) => samples.reduce((b, s) => { const d = (s[0]-x)**2 + (s[1]-y)**2; return d < b[0] ? [d, s[2]] : b; }, [1e9, 0])[1];
  const stops = [0, near(350, 93), near(570, 93), near(775, 93), near(645, 200)];
  const tags = ["t", "m", "c", "h", "c"];
  const steps = t("loopSteps");
  let pos = 0, stop = 0, running = !RM, visible = true, dwell = 0, last = 0, raf = 0;

  function mark(k){
    stop = k;
    boxes.forEach((b, j) => b.classList.toggle("on", j === k));
    cap.innerHTML = "";
    cap.append(h("span", {class:"tag " + tags[k]}, (k + 1) + " / 5"), " ", (Array.isArray(steps) && steps[k]) || "");
  }
  function place(){ const p = path.getPointAtLength(pos); dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); }
  function kick(){ if (!raf) raf = requestAnimationFrame(frame); }
  function setPlay(on){ running = on; play.textContent = on ? t("loopPause") : t("loopPlay"); last = 0; if (on) kick(); }
  function frame(ts){
    raf = 0;
    if (!running || !visible) return;
    const dt = last ? Math.min(64, ts - last) : 16; last = ts;
    if (dwell > 0){ dwell -= dt; kick(); return; }
    const target = stop === 4 ? L : stops[stop + 1];
    pos += dt * 0.16;
    if (pos >= target){
      if (stop === 4){ pos = stops[1]; mark(1); }   // yol modelin altında biter: döngü modelle sürer
      else { pos = target; mark(stop + 1); }
      dwell = 2600;
    }
    place(); kick();
  }
  play.onclick = () => setPlay(!running);
  next.onclick = () => { setPlay(false); const k = stop === 4 ? 1 : stop + 1; pos = stops[k]; mark(k); place(); };
  restart.onclick = () => { pos = 0; mark(0); place(); dwell = 2600; setPlay(!RM); };
  whenVisible(el, on => { visible = on; last = 0; if (on) kick(); });
  mark(0); place(); dwell = 2000; setPlay(running);
});
})();
