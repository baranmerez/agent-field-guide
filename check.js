// Seviye dosyalarını denetler: node check.js [dosya-adı-filtresi]
// - script sözdizimi (vm.Script)
// - data-widget adı olup kaydı olmayanlar / kaydı olup kullanılmayanlar
// - .g data-g terimi olup sözlükte olmayanlar
// - birden fazla dosyada aynı widget adı
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = path.join(__dirname, "src/levels");
const filter = process.argv[2] || "";
let problems = 0;
const allWidgets = {};
const glossAll = new Set();
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html")).sort();
const per = files.map(f => {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const scripts = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const js = scripts.join("\n");
  for (const m of js.matchAll(/["']([^"'\n]{1,60})["']\s*:\s*["'`]/g)) glossAll.add(m[1].toLocaleLowerCase("tr"));
  return { f, src, scripts, js };
});
for (const { f, src, scripts, js } of per){
  const out = [];
  scripts.forEach((s, i) => { try { new vm.Script(s, { filename: f + "#script" + i }); } catch(e){ out.push("SÖZDİZİMİ: " + e.message); } });
  const used = new Set([...src.matchAll(/data-widget="([^"]+)"/g)].map(m => m[1]));
  const reg = new Set([...js.matchAll(/Edu\.widget\(\s*["']([^"']+)["']/g)].map(m => m[1]));
  used.forEach(w => { if (!reg.has(w)) out.push("KAYITSIZ widget: " + w); });
  reg.forEach(w => { if (!used.has(w)) out.push("kullanılmayan widget: " + w); (allWidgets[w] = allWidgets[w] || []).push(f); });
  const terms = new Set([...src.matchAll(/class="g"[^>]*data-g="([^"]+)"/g)].map(m => m[1].toLocaleLowerCase("tr")));
  terms.forEach(t => { if (!glossAll.has(t)) out.push("sözlükte yok: " + t); });
  const sections = (src.match(/<section class="level"/g) || []).length;
  if (sections !== 1) out.push("section sayısı " + sections + " (1 olmalı)");
  const lessons = (src.match(/class="lesson"/g) || []).length;
  if (!filter || f.includes(filter)){
    console.log(f + ": " + lessons + " konu, " + used.size + " widget, " + Math.round(src.length/1024) + " KB" + (out.length ? "" : "  ✓"));
    out.forEach(x => console.log("   - " + x));
    problems += out.length;
  }
}
for (const [w, fs_] of Object.entries(allWidgets)) if (fs_.length > 1){ console.log("ÇAKIŞAN widget adı " + w + ": " + fs_.join(", ")); problems++; }
process.exitCode = problems ? 1 : 0;
