// server/start-server.ts
import { createServer } from "./index";
import { ChatWebSocketServer } from "./websocket";
import { initializePushNotifications, initializePackageSync } from "./index";
import http from "http";

function getPort(): number {
  const raw = process.env.PORT;
  const n = raw ? Number(raw) : NaN;
  if (!raw || Number.isNaN(n) || n <= 0) {
    console.error("❌ PORT env missing/invalid. Railway needs a valid PORT.");
    process.exit(1);
  }
  return n;
}

async function boot() {
  console.log("🚀 Boot v3: starting");

  const app = createServer();

  // add a tiny probe route right here (just in case)
  app.get("/", (_req, res) => res.status(200).send("probe ok: GET /"));
  app.get("/favicon.ico", (_req, res) => res.status(204).end());
  app.get("/__up", (_req, res) => res.status(200).json({ ok: true }));

  const PORT = getPort();

  // create raw http server so we can add deep logs/timeouts
  const server: http.Server = app.listen(PORT, "0.0.0.0");
  server.keepAliveTimeout = 65000;     // > 60s
  server.headersTimeout = 66000;       // little above keepAlive
  server.requestTimeout = 30000;       // 30s max per request

  server.on("listening", () => {
    console.log(`✅ HTTP listening PORT=${PORT}`);
  });

  server.on("connection", (socket) => {
    try {
      const raddr = socket.remoteAddress || "-";
      const rport = socket.remotePort || 0;
      // low-noise log:
      // console.log(`🔌 connection from ${raddr}:${rport}`);
    } catch { /* noop */ }
  });

  server.on("request", (req, _res) => {
    // lightweight trace so we know requests are hitting the app
    console.log(`➡️  ${req.method} ${req.url}`);
  });

  server.on("error", (err) => {
    console.error("💥 HTTP server error:", err);
  });

  // init side services AFTER listening so probe never blocks startup
  try {
    initializePushNotifications(server);
    initializePackageSync(server);
    new ChatWebSocketServer(server);
    console.log("💬 WebSocket/services ready");
  } catch (e) {
    console.error("⚠️  Service init error (continuing):", e);
  }

  // global safety nets
  process.on("unhandledRejection", (r) => {
    console.error("💥 UnhandledRejection:", r);
  });
  process.on("uncaughtException", (e) => {
    console.error("💥 UncaughtException:", e);
  });
}

boot().catch((e) => {
  console.error("❌ Boot failed:", e);
  process.exit(1);
});
