// Seviye dosyalarını tek bir HTML'de birleştirir.
//   node build.js            -> dist/ai-egitim.html  (iç sürüm: src/logo.datauri varsa logo eklenir)
//   node build.js --public   -> docs/index.html      (herkese açık sürüm: logo yok, footer public.config.json'dan)
// src/levels/*.html içindeki her dosya bir <section class="level"> ve isteğe bağlı <script> blokları içerir.
// Section'lar <main>'e, script'ler çekirdekten sonra ve app.js'ten önce eklenir.
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const rd = p => fs.readFileSync(path.join(dir, p), "utf8");
const isPublic = process.argv.includes("--public");
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

let shell = rd("src/shell.html");
const files = fs.readdirSync(path.join(dir, "src/levels")).filter(f => /\.html$/.test(f)).sort();
let sections = "", scripts = "";
for (const f of files){
  const src = rd("src/levels/" + f);
  const scriptRe = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
  const s = src.match(scriptRe) || [];
  sections += "\n<!-- ===== " + f + " ===== -->\n" + src.replace(scriptRe, "").trim() + "\n";
  scripts += s.map(x => "<!-- " + f + " -->\n" + x).join("\n") + "\n";
}

// Logo yalnızca iç sürümde ve dosya varsa eklenir; herkese açık sürümde hiç yer almaz.
const logoPath = path.join(dir, "src/logo.datauri");
const useLogo = !isPublic && fs.existsSync(logoPath);
const logoBlock = /<!--LOGO-START-->[\s\S]*?<!--LOGO-END-->/;
shell = useLogo ? shell.replace(logoBlock, m => m.replace("<!--LOGO-START-->", "").replace("<!--LOGO-END-->", "")) : shell.replace(logoBlock, "");

let footer = "";
if (isPublic){
  const cfg = JSON.parse(rd("public.config.json"));
  const link = (href, text) => href ? '<a href="' + esc(href) + '">' + esc(text) + "</a>" : "";
  const links = [link(cfg.github, "GitHub"), link(cfg.linkedin, "LinkedIn"), link(cfg.repo, "Kaynak kod")].filter(Boolean).join('<span aria-hidden="true">·</span>');
  footer = `<footer class="site-foot">
  <div class="sf-in">
    <div class="sf-brand"><b>Model, Harness, Agent</b><span>Yazılımcılar için Türkçe LLM ve coding agent eğitimi · ${esc(cfg.edition)} sürümü</span></div>
    <div class="sf-author"><span>Hazırlayan: <b>${esc(cfg.author)}</b></span><span class="sf-links">${links}</span></div>
    <p class="sf-lic">İçerik <a href="https://creativecommons.org/licenses/by/4.0/deed.tr">CC BY 4.0</a>, kod MIT lisanslıdır. Bilgiler ${esc(cfg.edition)} itibarıyla günceldir; model, fiyat ve araç ayrıntıları hızla değişir, her konunun sonundaki kaynaklar esastır.</p>
  </div>
</footer>`;
}

const parts = {
  "/*LOGO-CSS*/": useLogo ? ":root{--logo:url(" + fs.readFileSync(logoPath, "utf8").trim() + ")}" : "",
  "/*CSS*/": rd("src/shell.css"),
  "/*CORE*/": rd("src/core.js"),
  "/*APP*/": rd("src/app.js"),
  "<!--FOOTER-->": footer,
  "<!--LEVELS-->": sections,
  "<!--LEVEL-SCRIPTS-->": scripts
};
for (const [k, v] of Object.entries(parts)) shell = shell.split(k).join(v);
const out = isPublic ? path.join(dir, "docs/index.html") : path.join(dir, "dist/ai-egitim.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, shell);
console.log("Yazıldı:", out, (shell.length / 1024).toFixed(0) + " KB,", files.length, "seviye dosyası,", isPublic ? "herkese açık sürüm" : (useLogo ? "iç sürüm (logolu)" : "iç sürüm (logosuz)"));
