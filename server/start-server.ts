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
      await connectToDatabase();
      console.log("✅ DB: connected");
    })(),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`DB connect timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function start() {
  console.log("🚀 Boot v3: starting");

  const app = createServer();

  // 🟢 LISTEN IMMEDIATELY (Railway Edge ko yahi chahiye)
  const PORT = getPort();
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HTTP listening PORT=${PORT}`);
  });

  // services
  try {
    initializePushNotifications(server);
    initializePackageSync(server);
    new ChatWebSocketServer(server);
    console.log("💬 WebSocket/services ready");
  } catch (e) {
    console.error("⚠️ Service init error:", e);
  }

  // DB background
  try {
    await connectDbWithTimeout(10_000);
  } catch (e: any) {
    console.error("⚠️ DB connect issue:", e?.message || e);
  }
}

start().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});
