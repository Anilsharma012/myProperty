// server/node-build.ts
import http from "http";
import os from "os";
import { createServer, initializePushNotifications, initializePackageSync } from "./index";

/* --------------------------- boot diagnostics --------------------------- */
console.log("BOOT[node-build]: 0 file loaded");
process.on("uncaughtException", (e) => console.error("❌ UNCAUGHT:", e));
process.on("unhandledRejection", (e) => console.error("❌ UNHANDLED:", e));

/* ----------------------------- create server ---------------------------- */
let app: any;
try {
  console.log("BOOT[node-build]: 1 before createServer()");
  app = createServer(); // must return an Express app
  console.log("BOOT[node-build]: 2 after createServer()");
} catch (e) {
  console.error("❌ BOOT[node-build]: createServer() threw:", e);
  // tiny fallback so /__up can still answer for debugging
  const tiny = http.createServer((_req, res) => {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "createServer failed" }));
  });
  const p = Number(process.env.PORT ?? 8080);
  tiny.listen(p, "0.0.0.0", () => console.log(`🚑 tiny server on ${p}`));
  throw e;
}

app.set("trust proxy", 1);

/* ------------------------------- net config ----------------------------- */
const raw = process.env.PORT;
const PORT = Number(raw ?? 8080);
const HOST = "0.0.0.0";
if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error(`❌ Invalid PORT (${raw}), falling back to 8080`);
}

/* -------------------------------- server -------------------------------- */
const httpServer = http.createServer(app);
console.log("BOOT[node-build]: 3 http.createServer done");

// Reverse-proxy friendly timeouts
httpServer.keepAliveTimeout = 65_000;
httpServer.headersTimeout   = 66_000;

/* -------------------------------- helpers ------------------------------- */
function logInterfaces() {
  try {
    const ifaces = os.networkInterfaces();
    const flat = Object.entries(ifaces).flatMap(([name, addrs]) =>
      (addrs || []).map((a) => `${name}:${a.address}/${a.family}`)
    );
    console.log("🌐 Interfaces:", flat.join(", "));
  } catch {}
}

function selfPing() {
  const url = `http://127.0.0.1:${PORT}/__up`;
  const req = http.get(url, (res) => {
    const ok = !!res.statusCode && res.statusCode < 500;
    console.log(`🩺 self-ping ${url} -> ${res.statusCode} (ok=${ok})`);
    res.resume();
  });
  req.on("error", (err) => console.error("❌ self-ping error:", (err as any)?.message || err));
  req.setTimeout(5000, () => req.destroy(new Error("timeout")));
}

/* ------------------------------- start listen --------------------------- */
httpServer.on("error", (err: any) => {
  console.error("❌ httpServer error:", err?.code || err?.message || err);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ node-build listening PORT=${PORT} HOST=${HOST}`);
  logInterfaces();

  // Attach background services AFTER listen
  try { initializePushNotifications?.(httpServer); console.log("📱 Push notification service initialized"); }
  catch (e) { console.error("⚠️ push notifications init failed:", e); }
  try { initializePackageSync?.(httpServer); console.log("📦 Package sync service initialized"); }
  catch (e) { console.error("⚠️ package sync init failed:", e); }

  // reachability proof
  setTimeout(selfPing, 1000);
  setInterval(selfPing, 60_000);
});

/* ---------------------------- shutdown signals -------------------------- */
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Closing server...");
  httpServer.close(() => process.exit(0));
});
