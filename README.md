<p align="center">
  <a href="https://baranmerez.github.io/agent-field-guide/"><img src="assets/hero.svg" alt="Agent = Model + Harness" width="900"></a>
</p>

<p align="center">
  <b>A hands-on, interactive course on LLMs and coding agents for software developers.</b><br>
  <a href="https://baranmerez.github.io/agent-field-guide/en/"><b>Open the course →</b></a> &nbsp;·&nbsp; <a href="https://baranmerez.github.io/agent-field-guide/tr/"><b>Türkçe →</b></a>
</p>

When you work with Claude Code or Codex, every behavior comes from one of three places: the **model**, the **harness** around it, or the **context** it sees. This course teaches you to tell them apart. Each lesson explains one mechanism and lets you poke at it in an interactive diagram. No quizzes, no memorizing.

<p align="center"><img src="assets/loop.svg" alt="Agent loop: the model requests a tool, the harness runs it, the result goes back to the model" width="900"></p>

## What’s inside

| | |
|---|---|
| **0–2 · The model** | Tokens and tokenizers, sampling, the training pipeline, reasoning, hallucination, the context window, prompt caching |
| **3–5 · Talking to it, looping it** | Prompt myths vs evidence, tool use and MCP, the agent loop, failure modes |
| **6–7 · The harness** | Its layers, same model / different results, Claude vs Codex |
| **8–10 · Practice and security** | Claude Code (CLAUDE.md, permissions, hooks), headless/CI, evals, prompt injection, the lethal trifecta |

**69 lessons · 91 interactive diagrams · searchable glossary · 11 themes · English and Turkish.** Everything runs in your browser; nothing is sent anywhere. Facts are current as of **November 2026**, with sources at the end of every lesson.

## Türkçe

Yazılımcılar için Türkçe, etkileşimli bir LLM ve coding agent eğitimi. Claude Code ya da Codex ile çalışırken bir davranışın modelden mi, harness’tan mı, yoksa context’ten mi geldiğini ayırt etmeyi öğretiyor. Her konu bir mekanizmayı anlatıyor ve onu kurcalayabileceğin bir şemayla gösteriyor. **[Eğitimi aç →](https://baranmerez.github.io/agent-field-guide/tr/)**

## Development

No dependencies, just Node.js.

```bash
node build.js --public          # docs/en, docs/tr and a language router at docs/index.html
node check.js                   # validates level files and EN/TR parity
PORT=5178 node serve.js docs    # http://localhost:5178/en/index.html
```

Content lives in `src/levels/<lang>/`, one file per level; UI strings are in `src/i18n.json`. Follow [WRITING-GUIDE.md](WRITING-GUIDE.md) when adding content. Found an error or something outdated? Open an issue.

## License

Content [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), code MIT. See [LICENSE](LICENSE).

---

<sub>Created by <b>Baran Merez</b> · <a href="https://github.com/baranmerez">GitHub</a> · <a href="https://www.linkedin.com/in/baranmerez/">LinkedIn</a></sub>
