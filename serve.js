// Önizleme için küçük statik sunucu: node serve.js [klasör]  ->  http://localhost:5178/ (varsayılan klasör: dist)
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, process.argv[2] || "dist"); // isteğe bağlı: node serve.js .
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+$/, "/ai-egitim.html"));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end("yok"); }
    res.writeHead(200, {"Content-Type": ({".html":"text/html; charset=utf-8",".svg":"image/svg+xml",".md":"text/plain; charset=utf-8",".js":"text/javascript; charset=utf-8"})[path.extname(p)] || "application/octet-stream", "Cache-Control": "no-store"});
    res.end(data);
  });
}).listen(process.env.PORT || 5178, function(){ console.log("http://localhost:" + this.address().port + "/"); });
