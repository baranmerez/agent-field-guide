# Writing guide for level files

The training set is ONE static HTML page assembled by `node build.js` from
`src/shell.html` + `src/shell.css` + `src/core.js` + `src/app.js` + every
`src/levels/*.html` (sorted by file name). Each level file contains exactly one
`<section class="level">` plus `<script>` blocks. Do not edit shell/core/app files;
if you need a new shared helper, write it inside your own level file.

Reference example: `src/levels/00-giris.html` (read it first).

## Audience, language, tone

- Readers: Turkish-speaking software developers, from juniors to 25-year veterans.
  They use Claude Code and Codex daily or are about to.
- All reader-facing text is **Turkish**, natural and fluent (not translated-sounding).
  Address the reader informally with "sen" (never "siz"). Keep technical terms in
  English where developers use them (token, context, harness, hook, prompt, tool call,
  sandbox) and inflect with apostrophe: "token’lar", "harness’ın", "hook’u".
  Use the typographic apostrophe ’ consistently.
- Teach deeply: mechanism first, then consequence, then practice. Concrete numbers,
  real formats (real JSON shapes, real settings syntax), real failure stories.
  No marketing tone, no filler, no emoji.
- NO quizzes, tests, scoring or "check your answer" mechanics (the user explicitly
  rejected them). Interactives are exploratory simulations: play, step, toggle,
  type, compare, and see the mechanism.
- Every factual claim that could be outdated (model names, prices, context sizes,
  feature names, benchmark scores) must come from the research files and should be
  dated ("Kasım 2026 itibarıyla"). If research marks something UNVERIFIED, either
  omit it or say it is uncertain. Never invent numbers, quotes or features.
- Confidentiality: use invented names only; never real company, customer, database or product names
  in examples. Use: `Example Co`, `Test Ltd`,
  `example_app`, `exampledb`, `example.orders`, `example.customers`,
  `example.order_items`, `db.example.test`, `order_id`, `customer_id`,
  `status_code`, `created_at`, `amount`. Public products (Claude, Codex, GitHub,
  PostgreSQL, Angular, .NET etc.) are fine.

## Level file skeleton

```html
<section class="level" data-no="3" data-short="Prompt" data-title="Prompt engineering: fasa fisoyu ayıklamak"
  data-accent="ctx" data-time="45 dk"
  data-lede="One or two sentences shown in the hero and in the level map.">
  <div class="lesson" data-tab="Model ne görüyor?"> ...content... </div>
  <div class="lesson" data-tab="Folklor listesi"> ... </div>
  ...
</section>
<script> /* glossary entries + widgets for this level */ </script>
```

- `data-no`: level number. `data-short`: 1-2 words for the top tab. `data-accent`:
  one of `model` (purple), `harness` (teal), `ctx` (amber), `tool` (blue), `risk` (red).
- The shell auto-builds the hero (from data-title/data-lede/data-time) and the topic
  sub-tab bar (from each `.lesson[data-tab]`, keep tab labels short: 1-4 words).
- 4-7 lessons per level. Each lesson is a self-contained deep lesson
  (~700-1400 words of Turkish prose) with at least one interactive `.fig`.
- End each lesson (or at least the level's last lesson) with a `.keep` box and the
  lesson with sources in `.src`.

## Content components (CSS classes)

Prose: `h2`, `h3`, `h4`, `p`, `ul`, `ol`, `ol.steps` (numbered big circles), `.lead`.
Inline semantic colours: `<span class="m">` model, `.h` harness, `.c` context/token,
`.t` tool/practice, `.r` risk. Pills: `<span class="tag m|h|c|t|r|ok">`.

Glossary term: `<span class="g" data-g="Token">token</span>`; hover shows the
definition registered with `Edu.glossary({"Token": "…"})`. Register every key term of
your level (8-20 entries per level, Turkish definitions, 1-2 sentences). The key in
`data-g` must equal the glossary key (case-insensitive match is supported).

Callouts (`<div class="callout X"><span class="ct">Title</span>text</div>`):
- `bridge`  "Bunu zaten biliyorsun": map to a classic engineering concept.
- `myth`    "Folklor": a popular but wrong/outdated belief and the evidence.
- `deep`    "Derine in": optional deeper mechanism.
- `tip`     "Pratikte": actionable habit/setting.
- `warn`    "Dikkat": data/money/security risk.
- (none)    neutral note.

Summary: `<div class="keep"><h3>Akılda kalsın</h3><ul>…</ul></div>`
Sources: `<div class="src"><b>Kaynaklar</b><ol><li><a href="…">…</a></li></ol></div>`

Layout: `.cols` (auto grid) with `.card` children (`.card.m/.h/.c/.t/.r/.ok` = coloured
top border); `.vs` two columns with `<div class="bad" data-label="Zayıf">` and
`<div class="good" data-label="Güçlü">`; `.tbl > table`.
Code: `<pre data-title="settings.json"><code>…</code></pre>` (escape `<` `&` in code!).
A copy button is added automatically (not inside `.fig` unless `data-copy`).
Terminal look: `<div class="term"><div class="term-bar"><i></i><i></i><i></i><span>bash</span></div><div class="term-body">…</div></div>`
with spans `.p` prompt/green, `.d` dim, `.e` error, `.w` warning, `.b` blue, `.v` violet.
Chat transcript: `<div class="chat">` with `<div class="msg user|asst|tool|sys|evil"><span class="who">Kullanıcı</span>…</div>`.
JSON: `<div class="jsonv"></div>` filled with `el.innerHTML = Edu.json(obj, {hl:["key"]})`.
Flow: `<div class="flow"><div class="node m"><b>Title</b>text</div><span class="arrow">→</span>…</div>`;
toggle `.on` / `.done` classes from JS.
Bars: `.bars > .bar > (.lab, .track > .fill[style=width], .pct)`; `.bar.pick` highlights.
Chips: `.chips > .chip`. Meter: `.meter > i[style="width:30%;background:var(--ctx)"]`.
Stats: `.stats > span > b`. Legend: `.legend-row > span > .sw`.

## Interactive figures

```html
<div class="fig" data-widget="l3-ticket">
  <p class="fig-title">Aynı iş, iki ticket</p>
  <p class="fig-cap">What to do and what to notice.</p>
  ...static markup the widget uses (optional)...
</div>
```

Controls inside figures: `.ctrl` row, `.btn`, `.btn.ghost`, `.btn.sm`,
`.seg > button[data-v][aria-pressed]` (use `Edu.seg(segEl, (v, btn) => …)`),
`.range > label + input[type=range] + output`, `textarea.field`, `input.field`,
`select.field`, `.panel` (result area), `.hint`, `.mono`, `.muted`.

Widget registration (in the level's `<script>`):

```js
Edu.widget("l3-ticket", el => {
  const { h, $, $$, json, sleep, stepper, seg, runner, typewrite, tokenize, RM } = Edu;
  // build or wire up the UI inside el; runs once, when its lesson tab is first opened
});
```

Widget names must be unique and prefixed with your level: `l0-…`, `l7-…`.

Core helpers (`window.Edu`):
- `h(tag, props, ...children)` create element; props: class, html, text, style (obj),
  onclick…, any attribute.
- `$(sel, root)`, `$$(sel, root)` (array), `esc(str)`.
- `sleep(ms)` (shortened automatically under reduced motion), `RM` boolean.
- `runner()` → `{start(), stop()}`: `const cancelled = r.start();` then check
  `if (cancelled()) return;` inside async loops so restarting cancels the old run.
- `typewrite(el, text, {speed, cancelled})` async typewriter.
- `json(obj, {hl:[keys]})` coloured JSON HTML.
- `tokenize(text)` approximate tokenizer (array of string pieces).
- `stepper(el, {steps:[…], render(i, step, {body}), auto: ms, loop})` adds
  ←Geri ▶Oynat İleri→ ↺Baştan + dots, and a `.stp-body` to render into. Use this
  for every step-by-step animation (pipelines, agent loops, request lifecycles).
- `seg(el, cb)` segmented buttons.
- `store.get/set` safe localStorage (rarely needed).

Rules for widgets:
- Pure JS, no libraries, no network calls, no `fetch`. Never write the string
  `</script>` inside a script (split it as `"<\/script>"` if needed).
- Use CSS variables for every colour (`var(--model)`, `var(--acc)`, `var(--soft)`…) so
  light and dark themes both work. No hard-coded light-only colours.
- Must work at 360px width: wrap controls, no fixed widths over ~320px, tables in `.tbl`.
- Keyboard accessible: use `<button type="button">` for clickables, labels for inputs,
  `aria-live="polite"` on result panels.
- Inline SVG diagrams are welcome (use `currentColor`/CSS variables, `viewBox`,
  `width:100%`).
- Each interactive must teach a mechanism, not decorate. Ideas that work well: step
  through raw request/response JSON of an agent turn; sliders that recompute a real
  formula (softmax, cost, context fill); toggles that show which defence layer stops an
  attack; a rule matcher where the reader types a command; before/after prompt diffs
  with annotations; simulated terminals replaying a realistic session.
- Aim for 1-3 interactives per lesson; make at least one per level substantial
  (multi-step, realistic data).

## Quality bar

- Depth over breadth, but cover the level's topic fully. Developers should leave a
  lesson able to explain the mechanism to a colleague and apply it the next day.
- Every lesson: mechanism → "bunu zaten biliyorsun" bridge where natural → practical
  consequence → pitfalls → keep box. Folklore busting where relevant.
- Keep the old set's good parts (read your levels in the original file) but rewrite,
  deepen and modernise; drop anything the research shows is outdated.
- After writing, run `node build.js` from the `egitim` folder and fix any error; then
  sanity-check your scripts with `node --check` on extracted JS if practical.
