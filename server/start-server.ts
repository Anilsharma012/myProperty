import http from "http";
import os from "os";
import { createServer, initializePackageSync, initializePushNotifications } from "./index";

const app = createServer();
const server = http.createServer(app);

// Reverse proxy friendly timeouts
server.keepAliveTimeout = 65_000;   // ms
server.headersTimeout   = 66_000;   // ms

const PORT = Number(process.env.PORT || 8080);
const HOST = "0.0.0.0";

function logNet() {
  try {
    const ifaces = os.networkInterfaces();
    const flat = Object.entries(ifaces).flatMap(([name, addrs]) =>
      (addrs || []).map(a => `${name}:${a.address}/${a.family}`)
    );
    console.log("🌐 Interfaces:", flat.join(", "));
  } catch {}
}

server.listen(PORT, HOST, () => {
  console.log(`✅ HTTP listening PORT=${PORT} HOST=${HOST}`);
  logNet();

  // Initialize background services AFTER listen
  try {
    initializePushNotifications(server);
  } catch (e) {
    console.error("⚠️ push notifications init failed:", e);
  }
  try {
    initializePackageSync(server);
  } catch (e) {
    console.error("⚠️ package sync init failed:", e);
  }

  // Self-ping: proves app is reachable inside container
  const url = `http://127.0.0.1:${PORT}/__up`;
  const tick = () => {
    const req = http.get(url, (res) => {
      let ok = res.statusCode && res.statusCode < 500;
      console.log(`🩺 self-ping ${url} -> ${res.statusCode} (ok=${ok})`);
      res.resume();
    });
    req.on("error", (err) => console.error("❌ self-ping error:", err.message));
    req.setTimeout(5000, () => req.destroy(new Error("timeout")));
  };
  setTimeout(tick, 1000);
  setInterval(tick, 60_000);
});

server.on("error", (err: any) => {
  console.error("❌ server error:", err?.message || err);
});

process.on("unhandledRejection", (r) => console.error("❌ unhandledRejection:", r));
process.on("uncaughtException", (e) => console.error("❌ uncaughtException:", e));
