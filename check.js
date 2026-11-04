// Seviye dosyalarını denetler: node check.js [dil] [dosya-adı-filtresi]
//   örnek: node check.js          (bütün diller)
//          node check.js en 05    (yalnızca İngilizce, adında 05 geçenler)
// Her dil klasörü (src/levels/<dil>) için:
// - script sözdizimi (vm.Script)
// - data-widget adı olup kaydı olmayanlar / kaydı olup kullanılmayanlar
// - .g data-g terimi olup sözlükte olmayanlar
// - birden fazla dosyada aynı widget adı
// Diller arası: aynı dosyalar, aynı konu sayısı, aynı widget adları, aynı data-no.
const fs = require("fs"), path = require("path"), vm = require("vm");
const base = path.join(__dirname, "src/levels");
const langs = fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory()).sort();
const onlyLang = langs.includes(process.argv[2]) ? process.argv[2] : null;
const filter = (onlyLang ? process.argv[3] : process.argv[2]) || "";
let problems = 0;
const summary = {};

for (const lang of langs){
  const dir = path.join(base, lang);
  const allWidgets = {};
  const glossAll = new Set();
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".html")).sort();
  const per = files.map(f => {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const scripts = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    const js = scripts.join("\n");
    for (const m of js.matchAll(/["']([^"'\n]{1,60})["']\s*:\s*["'`]/g)) glossAll.add(m[1].toLocaleLowerCase(lang));
    return { f, src, scripts, js };
  });
  summary[lang] = {};
  if (!onlyLang || onlyLang === lang) console.log("== " + lang + " ==");
  for (const { f, src, scripts, js } of per){
    const out = [];
    scripts.forEach((s, i) => { try { new vm.Script(s, { filename: f + "#script" + i }); } catch(e){ out.push("SÖZDİZİMİ: " + e.message); } });
    const used = new Set([...src.matchAll(/data-widget="([^"]+)"/g)].map(m => m[1]));
    const reg = new Set([...js.matchAll(/Edu\.widget\(\s*["']([^"']+)["']/g)].map(m => m[1]));
    used.forEach(w => { if (!reg.has(w)) out.push("KAYITSIZ widget: " + w); });
    reg.forEach(w => { if (!used.has(w)) out.push("kullanılmayan widget: " + w); (allWidgets[w] = allWidgets[w] || []).push(f); });
    const terms = new Set([...src.matchAll(/class="g"[^>]*data-g="([^"]+)"/g)].map(m => m[1].toLocaleLowerCase(lang)));
    terms.forEach(t => { if (!glossAll.has(t)) out.push("sözlükte yok: " + t); });
    const sections = (src.match(/<section class="level"/g) || []).length;
    if (sections !== 1) out.push("section sayısı " + sections + " (1 olmalı)");
    const lessons = (src.match(/class="lesson"/g) || []).length;
    const no = (src.match(/<section class="level"[^>]*data-no="([^"]+)"/) || [])[1];
    summary[lang][f] = { lessons, widgets: [...used].sort().join(","), no };
    if ((!onlyLang || onlyLang === lang) && (!filter || f.includes(filter))){
      console.log(f + ": " + lessons + " konu, " + used.size + " widget, " + Math.round(src.length/1024) + " KB" + (out.length ? "" : "  ✓"));
      out.forEach(x => console.log("   - " + x));
      problems += out.length;
    }
  }
  for (const [w, fs_] of Object.entries(allWidgets)) if (fs_.length > 1){ console.log("ÇAKIŞAN widget adı " + w + ": " + fs_.join(", ")); problems++; }
}

// Diller arası eşleşme: referans dil tr
if (langs.length > 1 && summary.tr){
  console.log("== diller arası ==");
  for (const lang of langs.filter(l => l !== "tr")){
    const a = summary.tr, b = summary[lang];
    for (const f of Object.keys(a)){
      if (filter && !f.includes(filter)) continue;
      if (!b[f]){ console.log(lang + ": eksik dosya " + f); problems++; continue; }
      const d = [];
      if (a[f].lessons !== b[f].lessons) d.push("konu sayısı " + a[f].lessons + " ≠ " + b[f].lessons);
      if (a[f].no !== b[f].no) d.push("data-no " + a[f].no + " ≠ " + b[f].no);
      if (a[f].widgets !== b[f].widgets) d.push("widget adları farklı");
      if (d.length){ console.log(lang + "/" + f + ": " + d.join("; ")); problems += d.length; }
    }
    for (const f of Object.keys(b)) if (!a[f]){ console.log(lang + ": fazladan dosya " + f); problems++; }
  }
  if (!problems) console.log("eşleşme ✓");
}
process.exitCode = problems ? 1 : 0;
