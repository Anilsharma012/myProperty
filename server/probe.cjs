// server/probe.cjs
const http = require("http");

const raw = process.env.PORT;
const PORT = Number(raw);
if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error("PORT missing/invalid:", raw);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end(`probe ok: ${req.method} ${req.url}\n`);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("🔎 PROBE listening on", PORT);
});
