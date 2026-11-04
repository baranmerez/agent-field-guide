<p align="center">
  <a href="https://baranmerez.github.io/model-harness-agent/"><img src="assets/hero.svg" alt="Agent = Model + Harness" width="900"></a>
</p>

<p align="center">
  <b>Yazılımcılar için Türkçe, etkileşimli LLM ve coding agent eğitimi.</b><br>
  <a href="https://baranmerez.github.io/model-harness-agent/"><b>Eğitimi aç →</b></a>
</p>

Claude Code ya da Codex ile çalışırken bir davranışın modelden mi, harness’tan mı, yoksa context’ten mi geldiğini ayırt edebilmek için hazırlanmış bir set. Her konu bir mekanizmayı anlatıyor ve onu kurcalayabileceğin bir şemayla gösteriyor. Quiz yok, ezber yok.

<p align="center"><img src="assets/loop.svg" alt="Agent döngüsü: model araç ister, harness çalıştırır, sonuç modele döner" width="900"></p>

## İçinde ne var

| | |
|---|---|
| **0–2 · Model** | Token ve tokenizer, sampling, eğitim hattı, reasoning, halüsinasyon, context window, prompt caching |
| **3–5 · Konuşmak ve döngü** | Prompt’ta folklor ve kanıt, tool use ve MCP, agent loop, başarısızlık modları |
| **6–7 · Harness** | Katmanlar, aynı model farklı sonuç, Claude ve Codex karşılaştırması |
| **8–10 · Pratik ve güvenlik** | Claude Code (CLAUDE.md, izinler, hook’lar), headless/CI, eval, prompt injection, ölümcül üçlü |

**69 konu · 91 etkileşimli şema · aranabilir sözlük · 11 tema.** Her şey tarayıcıda çalışır, hiçbir yere veri gönderilmez. Bilgiler **Kasım 2026** itibarıyla günceldir; her konunun sonunda kaynakları var.

## Geliştirme

Bağımlılık yok, yalnızca Node.js.

```bash
node build.js --public   # docs/index.html (GitHub Pages bunu yayınlar)
node check.js            # seviye dosyalarını denetler
node serve.js docs       # http://localhost:5178/index.html
```

İçerik `src/levels/` altında, seviye başına bir dosya. Yeni içerik yazarken [WRITING-GUIDE.md](WRITING-GUIDE.md)’ye uy. Hata ya da eskimiş bilgi görürsen issue açman yeter.

## Lisans

İçerik [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.tr), kod MIT. Ayrıntılar [LICENSE](LICENSE)’ta.

---

<sub>Hazırlayan: <b>Baran Merez</b> · <a href="https://github.com/baranmerez">GitHub</a> · <a href="https://www.linkedin.com/in/baranmerez/">LinkedIn</a></sub>
