// Seviye dosyalarını dil başına tek bir HTML'de birleştirir.
//   node build.js            -> dist/ai-egitim.html (tr), dist/ai-egitim-en.html (en)
//                               iç sürüm: src/logo.datauri varsa logo eklenir
//   node build.js --public   -> docs/tr/index.html, docs/en/index.html, docs/index.html (dil yönlendirici)
//                               herkese açık sürüm: logo yok, footer public.config.json'dan
// src/levels/<dil>/*.html içindeki her dosya bir <section class="level"> ve isteğe bağlı <script> blokları içerir.
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const rd = p => fs.readFileSync(path.join(dir, p), "utf8");
const isPublic = process.argv.includes("--public");
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fill = (s, vars) => Object.entries(vars).reduce((acc, [k, v]) => acc.split("{" + k + "}").join(v), s);

const I18N = JSON.parse(rd("src/i18n.json"));
const levelRoot = path.join(dir, "src/levels");
const langs = fs.readdirSync(levelRoot).filter(d => fs.statSync(path.join(levelRoot, d)).isDirectory() && I18N[d]).sort();
const logoPath = path.join(dir, "src/logo.datauri");
const useLogo = !isPublic && fs.existsSync(logoPath);
const cfg = isPublic ? JSON.parse(rd("public.config.json")) : null;

// Her dilin çıktı yolu ve diğer dile göreli bağlantı
const outPath = lang => isPublic ? path.join(dir, "docs", lang, "index.html") : path.join(dir, "dist", lang === "tr" ? "ai-egitim.html" : "ai-egitim-" + lang + ".html");
const hrefTo = (from, to) => isPublic ? "../" + to + "/index.html" : path.basename(outPath(to));

function buildLang(lang){
  const S = I18N[lang];
  const other = langs.find(l => l !== lang);
  let shell = rd("src/shell.html");

  const files = fs.readdirSync(path.join(levelRoot, lang)).filter(f => /\.html$/.test(f)).sort();
  let sections = "", scripts = "";
  for (const f of files){
    const src = fs.readFileSync(path.join(levelRoot, lang, f), "utf8");
    const scriptRe = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
    const s = src.match(scriptRe) || [];
    sections += "\n<!-- ===== " + lang + "/" + f + " ===== -->\n" + src.replace(scriptRe, "").trim() + "\n";
    scripts += s.map(x => "<!-- " + lang + "/" + f + " -->\n" + x).join("\n") + "\n";
  }

  // Logo yalnızca iç sürümde ve dosya varsa; herkese açık sürümde hiç yer almaz.
  const logoBlock = /<!--LOGO-START-->[\s\S]*?<!--LOGO-END-->/;
  shell = useLogo ? shell.replace(logoBlock, m => m.replace("<!--LOGO-START-->", "").replace("<!--LOGO-END-->", "")) : shell.replace(logoBlock, "");

  // Diğer dil yoksa dil düğmesi kaldırılır.
  if (!other) shell = shell.replace(/\s*<a class="icon-btn lang-btn"[^>]*>[\s\S]*?<\/a>/, "");

  let footer = "";
  if (isPublic){
    const edition = S.edition;
    const link = (href, text) => href ? '<a href="' + esc(href) + '">' + esc(text) + "</a>" : "";
    const links = [link(cfg.github, "GitHub"), link(cfg.linkedin, "LinkedIn"), link(cfg.repo, S.footSource)].filter(Boolean).join('<span aria-hidden="true">·</span>');
    footer = `<footer class="site-foot">
  <div class="sf-in">
    <div class="sf-brand"><b>${esc(S.brand)}</b><span>${esc(fill(S.footTag, {edition}))}</span></div>
    <div class="sf-author"><span>${esc(S.footBy)}: <b>${esc(cfg.author)}</b></span><span class="sf-links">${links}</span></div>
    <p class="sf-lic">${fill(S.footLicense, {edition})}</p>
  </div>
</footer>`;
  }

  const alt = isPublic && other
    ? langs.map(l => `<link rel="alternate" hreflang="${l}" href="../${l}/">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="../">`
    : "";
  const i18nJs = ("window.EDU_LANG=" + JSON.stringify(lang) + ";window.EDU_T=" + JSON.stringify(S) + ";").replace(/<\//g, "<\\/");

  const parts = {
    "/*LOGO-CSS*/": useLogo ? ":root{--logo:url(" + fs.readFileSync(logoPath, "utf8").trim() + ")}" : "",
    "/*CSS*/": rd("src/shell.css") + "\n" + rd("src/anim.css"),
    "/*I18N*/": i18nJs,
    "/*CORE*/": rd("src/core.js") + "\n" + rd("src/anim.js"),
    "/*APP*/": rd("src/app.js"),
    "<!--ALT-LINKS-->": alt,
    "<!--FOOTER-->": footer,
    "<!--LEVELS-->": sections,
    "<!--LEVEL-SCRIPTS-->": scripts
  };
  // Önce {{anahtar}} yer tutucuları (yalnızca kabukta; seviye içeriğine dokunmaz)
  const vars = Object.assign({}, S, { lang, otherLang: other || "", otherHref: other ? hrefTo(lang, other) : "" });
  shell = shell.replace(/\{\{(\w+)\}\}/g, (m, k) => typeof vars[k] === "string" ? esc(vars[k]) : m);
  for (const [k, v] of Object.entries(parts)) shell = shell.split(k).join(v);

  const out = outPath(lang);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, shell);
  console.log("Yazıldı:", path.relative(dir, out), (shell.length / 1024).toFixed(0) + " KB,", files.length, "seviye dosyası,", isPublic ? "herkese açık" : (useLogo ? "iç sürüm (logolu)" : "iç sürüm"));
}

langs.forEach(buildLang);

// Herkese açık kök: tarayıcı diline (ya da son seçilen dile) göre yönlendirir.
if (isPublic){
  const known = JSON.stringify(langs);
  const router = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(I18N.en ? I18N.en.brand : I18N.tr.brand)}</title>
<meta name="description" content="${esc((I18N.en || I18N.tr).metaDesc)}">
${langs.map(l => `<link rel="alternate" hreflang="${l}" href="${l}/">`).join("\n")}
<script>
(function(){
  var known = ${known}, pick = null;
  try { pick = JSON.parse(localStorage.getItem("egitim:lang")); } catch(e){}
  if (known.indexOf(pick) < 0){
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < prefs.length && !pick; i++){ var p = String(prefs[i]).slice(0, 2).toLowerCase(); if (known.indexOf(p) >= 0) pick = p; }
  }
  if (known.indexOf(pick) < 0) pick = known.indexOf("en") >= 0 ? "en" : known[0];
  location.replace(pick + "/index.html" + location.hash);
})();
</script>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#F5F6FA;color:#141B27}a{margin:0 .6rem;font-weight:700;color:#2456C9}@media(prefers-color-scheme:dark){body{background:#0F131A;color:#E7EAF0}a{color:#7EA6FF}}</style>
</head>
<body><p>${langs.map(l => `<a href="${l}/index.html" hreflang="${l}">${l === "tr" ? "Türkçe" : l === "en" ? "English" : l}</a>`).join(" · ")}</p></body>
</html>
`;
  fs.writeFileSync(path.join(dir, "docs/index.html"), router);
  console.log("Yazıldı: docs/index.html (dil yönlendirici)");
}
