# Translation brief: Turkish → English level files

This repository is a static, interactive course ("Agent Roadmap: Model, Harness, Agent"). Use this brief for any new language too: replace `en` with the target language code and add its UI strings to `src/i18n.json`.
Source files: `src/levels/tr/*.html`. Target: `src/levels/en/<same file name>`.
Read `WRITING-GUIDE.md` (component and widget rules) and `src/core.js` (Edu API) first.

## Goal

A faithful, natural English edition. Same structure, same depth, same interactives;
it must read as if originally written in English by a senior engineer, not as a
translation. Do not shorten, summarise or add content.

## Must stay identical (the language switcher and checks depend on it)

- File names, `data-no`, `data-accent`, number and order of `.lesson` blocks.
- Every `data-widget` name, every `Edu.widget("…")` name, element ids, CSS classes,
  `data-*` attribute values used by scripts, `data-goto` targets, hashes like `#L5/3`.
- Code logic of widgets. Only translate strings (labels, captions, button text,
  sample texts, explanations, aria-labels, titles, tooltips). Keep numbers, formulas,
  JSON keys, commands, config syntax, URLs and source links unchanged.
- Code blocks: translate comments and natural-language string values only when they
  are illustrative prose; keep real command/config syntax exactly.

## Translate

- `data-title`, `data-short`, `data-lede`, `data-time` ("45 dk" → "45 min"), `data-tab`.
- All prose, headings, callout titles, table text, captions, hints.
- Callout titles: "Bunu zaten biliyorsun" → "You already know this"; "Folklor" → "Myth";
  "Derine in" → "Go deeper"; "Pratikte" → "In practice"; "Dikkat" → "Caution";
  "Bir uyarı" → "A word of caution"; "Akılda kalsın" → "Key takeaways";
  "Kaynaklar" → "Sources".
- Glossary: translate `Edu.glossary({...})` definitions into English. Keys are usually
  English terms already; if a key is Turkish, translate it AND update every
  `data-g="…"` that refers to it in the same file.
- Dates and numbers: "Kasım 2026 itibarıyla" → "as of November 2026"; Turkish decimal
  comma → decimal point (0,5 → 0.5); "%17" → "17%"; thousands separators to English.
  In widget JS, `toLocaleString("tr")`/`toLocaleLowerCase("tr")` → `"en"` unless the
  code is specifically processing Turkish text.
- Tone: second person, direct, warm, technical. Keep English technical terms
  (token, harness, hook, tool call) as they are.

## Turkish-specific content

Some lessons use Turkish on purpose (the tokenizer "Turkish token tax", a Turkish
sentence in a BPE or attention demo, Turkish suffixes like -ler/-lar). Keep those
Turkish examples where the language difference IS the lesson, and explain them for
an international reader ("Turkish is agglutinative: one word can carry what English
says in a phrase…"); frame it as "non-English languages, Turkish as the example".
Where Turkish was just the narration language of a sample (a chat message, a
commit message, a ticket), translate the sample into English.

Turkish idioms and jokes: rewrite with an equivalent English idiom, do not translate
literally.

## Confidentiality

No real company, customer, database or product names. Keep the invented examples
(`Example Co`, `example.orders`, `db.example.test`…).

## Rules for scripts

- Never write the literal `</script>` inside a script.
- Keep each file's script wrapping exactly as in the source (IIFE etc.).
- Theme-safe colours only (they already are; do not add hard-coded colours).

## Verify before reporting

From the repository root:
1. `node check.js en <file-filter>` must show ✓ for each of your files, and the
   "diller arası" (cross-language) section must report no differences for your files
   (same lesson count, same data-no, same widget names).
2. `node build.js --public` then serve with `PORT=<your port> node serve.js docs`
   (run in background) and open `http://localhost:<port>/en/index.html#L<no>/1` in the
   browser if one is available to you: open every lesson of your levels, run every
   widget once, and confirm there are no console errors. If no browser is available,
   say so; do not claim visual checks you did not do.
3. Grep your files for leftover Turkish outside the intentional examples, e.g.
   `grep -nE "[çğıöşüÇĞİÖŞÜ]" src/levels/en/<file>` and review every hit.
