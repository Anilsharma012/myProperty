// server/start-server.ts
import http from "http";
import os from "os";
import { createServer, initializePushNotifications, initializePackageSync } from "./index";

/* ------------------------------------------------------------------ *
 *                 BOOT DIAGNOSTICS (visible in Railway)              *
 * ------------------------------------------------------------------ */
console.log("BOOT: 0 file loaded");
process.on("uncaughtException", (e) => console.error("❌ UNCAUGHT:", e));
process.on("unhandledRejection", (e) => console.error("❌ UNHANDLED:", e));

const SAFE_MODE = (process.env.SAFE_MODE || "").toLowerCase() === "1"; // skip heavy inits if 1

/* ------------------------------------------------------------------ *
 *                           CREATE EXPRESS                           *
 * ------------------------------------------------------------------ */
let app: any;
try {
  console.log("BOOT: 1 before createServer()");
  app = createServer();                     // must return an Express app
  console.log("BOOT: 2 after createServer()");
} catch (e) {
  console.error("❌ BOOT: createServer() threw:", e);
  // Fallback tiny server so /__up still responds (helps debug)
  const tiny = http.createServer((_req, res) => {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "createServer failed" }));
  });
  const port = Number(process.env.PORT ?? 8080);
  tiny.listen(port, "0.0.0.0", () => {
    console.log(`🚑 TINY SERVER listening on ${port} (createServer failed)`);
  });
  throw e;
}

app.set("trust proxy", 1);                  // secure cookies behind Railway/Proxy

/* ------------------------------------------------------------------ *
 *                          NET / SERVER SETUP                        *
 * ------------------------------------------------------------------ */
const rawPort = process.env.PORT;
const PORT = Number(rawPort ?? 8080);       // fallback just in case
const HOST = "0.0.0.0";
if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error(`❌ Invalid PORT env (${rawPort}). Falling back to 8080`);
}

const httpServer = http.createServer(app);
console.log("BOOT: 3 http.createServer done");

// Reverse-proxy friendly timeouts
httpServer.keepAliveTimeout = 65_000;
httpServer.headersTimeout   = 66_000;

/* ------------------------------------------------------------------ *
 *                               HELPERS                              *
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ *
 *                             START LISTEN                           *
 * ------------------------------------------------------------------ */
httpServer.on("error", (err: any) => {
  console.error("❌ httpServer error:", err?.code || err?.message || err);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ HTTP listening PORT=${PORT} HOST=${HOST}`);
  logInterfaces();

  // Attach background/WS services AFTER listen so they reuse same server
  if (SAFE_MODE) {
    console.log("🟡 SAFE_MODE=1 → skipping background initializers");
  } else {
    try {
      initializePushNotifications?.(httpServer);
      console.log("📱 Push notification service initialized");
    } catch (e) {
      console.error("⚠️ push notifications init failed:", e);
    }
    try {
      initializePackageSync?.(httpServer);
      console.log("📦 Package sync service initialized");
    } catch (e) {
      console.error("⚠️ package sync init failed:", e);
    }
  }

  // prove reachability inside container
  setTimeout(selfPing, 1000);
  setInterval(selfPing, 60_000);
});

/* ------------------------------------------------------------------ *
 *                        GRACEFUL SHUTDOWN/LOGS                      *
 * ------------------------------------------------------------------ */
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Closing server...");
  httpServer.close(() => process.exit(0));
});
