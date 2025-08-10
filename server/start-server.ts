// server/start-server.ts
import { createServer, initializePushNotifications, initializePackageSync } from "./index";
import { ChatWebSocketServer } from "./websocket";
import { connectToDatabase } from "./db/mongodb";

function getPort(): number {
  const raw = process.env.PORT;
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) {
    console.error("❌ PORT missing/invalid:", raw);
    process.exit(1);
  }
  return n;
}

async function connectDbWithTimeout(ms: number) {
  return Promise.race([
    (async () => {
      console.log("🔄 DB: connecting…");
      const conn = await connectToDatabase();
      console.log("✅ DB: connected");
      return conn;
    })(),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`DB connect timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function start() {
  // global safety nets
  process.on("unhandledRejection", (err) => {
    console.error("🔥 UnhandledRejection:", err);
  });
  process.on("uncaughtException", (err) => {
    console.error("🔥 UncaughtException:", err);
  });

  console.log("🚀 Boot: starting server process");
  const app = createServer();

  // 1) LISTEN IMMEDIATELY (very important for Railway)
  const PORT = getPort();
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HTTP server listening on PORT=${PORT}`);
  });

  // 2) INIT services that depend on server socket
  try {
    initializePushNotifications(server);
    initializePackageSync(server);
    new ChatWebSocketServer(server);
    console.log("💬 Chat/WebSocket & services initialized");
  } catch (e) {
    console.error("⚠️ Service init error:", e);
  }

  // 3) CONNECT DB IN BACKGROUND (don’t block listen)
  try {
    await connectDbWithTimeout(10_000);
  } catch (e) {
    console.error("⚠️ DB connect issue:", (e as Error).message);
    // app will still serve / and other non-DB endpoints
  }
}

start().catch((e) => {
  console.error("❌ Fatal startup error:", e);
  process.exit(1);
});
