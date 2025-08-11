// server/start-server.ts
import http from "http";
import os from "os";
import { createServer, initializePushNotifications, initializePackageSync } from "./index";

/* --------------------------- boot diagnostics --------------------------- */
console.log("BOOT: 0 file loaded");
process.on("uncaughtException", (e) => console.error("❌ UNCAUGHT:", e));
process.on("unhandledRejection", (e) => console.error("❌ UNHANDLED:", e));

/* ----------------------------- create server ---------------------------- */
let app;
try {
  console.log("BOOT: 1 before createServer()");
  app = createServer();                       // must return an Express app
  console.log("BOOT: 2 after createServer()");
} catch (e) {
  console.error("❌ BOOT: createServer() threw:", e);
  throw e;
}

app.set("trust proxy", 1);                    // secure cookies behind proxy

/* ------------------------------- net config ----------------------------- */
const rawPort = process.env.PORT;
const PORT = Number(rawPort ?? 8080);         // fallback just in case
if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error(`❌ Invalid PORT env (${rawPort}). Falling back to 8080`);
}
const HOST = "0.0.0.0";

/* -------------------------------- server -------------------------------- */
const httpServer = http.createServer(app);
console.log("BOOT: 3 http.createServer done");

// Reverse-proxy friendly timeouts (avoid LB 15s weirdness)
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
  req.on("error", (err) => console.error("❌ self-ping error:", err?.message || err));
  req.setTimeout(5000, () => req.destroy(new Error("timeout")));
}

/* ------------------------------- start listen --------------------------- */
httpServer.on("error", (err: any) => {
  console.error("❌ httpServer error:", err?.code || err?.message || err);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ HTTP listening PORT=${PORT} HOST=${HOST}`);
  logInterfaces();

  // Attach background/WS services AFTER listen so they reuse same server
  try {
    initializePushNotifications?.(httpServer);
  } catch (e) {
    console.error("⚠️ push notifications init failed:", e);
  }
  try {
    initializePackageSync?.(httpServer);
  } catch (e) {
    console.error("⚠️ package sync init failed:", e);
  }

  // prove reachability inside container
  setTimeout(selfPing, 1000);
  setInterval(selfPing, 60_000);
});

/* ---------------------------- shutdown signals -------------------------- */
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Closing server...");
  httpServer.close(() => process.exit(0));
});
