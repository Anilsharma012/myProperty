// server/start-server.ts
import http from "http";
import os from "os";
import { createServer, initializePushNotifications, initializePackageSync } from "./index";

// ---- create app/http server ----
const app = createServer();              // your createServer() must return an Express app
app.set("trust proxy", 1);               // secure cookies behind Railway proxy

const raw = process.env.PORT;            // Railway always sets PORT
const PORT = raw ? Number(raw) : NaN;
if (!PORT || Number.isNaN(PORT)) {
  console.error("❌ PORT env missing. Railway requires PORT.");
  process.exit(1);
}
const HOST = "0.0.0.0";

const httpServer = http.createServer(app);

// Reverse-proxy friendly timeouts (avoid LB 15s weirdness)
httpServer.keepAliveTimeout = 65_000;
httpServer.headersTimeout   = 66_000;

// ---- helpers ----
function logInterfaces() {
  try {
    const ifaces = os.networkInterfaces();
    const flat = Object.entries(ifaces).flatMap(([name, addrs]) =>
      (addrs || []).map(a => `${name}:${a.address}/${a.family}`)
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
  req.on("error", (err) => console.error("❌ self-ping error:", err.message));
  req.setTimeout(5000, () => req.destroy(new Error("timeout")));
}

// ---- start listening ----
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

// ---- hardening & shutdown ----
httpServer.on("error", (err: any) => {
  console.error("❌ httpServer error:", err?.code || err?.message || err);
});

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Closing server...");
  httpServer.close(() => process.exit(0));
});

process.on("unhandledRejection", (r) => console.error("❌ unhandledRejection:", r));
process.on("uncaughtException", (e) => console.error("❌ uncaughtException:", e));
