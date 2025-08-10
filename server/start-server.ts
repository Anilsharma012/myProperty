import { createServer, initializePushNotifications, initializePackageSync } from "./index";
import { ChatWebSocketServer } from "./websocket";
import { connectToDatabase } from "./db/mongodb";

function getPort(): number {
  const raw = process.env.PORT ?? "";
  const port = Number.parseInt(raw, 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("PORT env missing/invalid. Railway requires listening on process.env.PORT.");
  }
  return port;
}

async function startServer() {
  try {
    console.log("🔄 Initializing database connection...");
    await connectToDatabase();
    console.log("✅ Database connection established");

    const app = createServer();

    const PORT = getPort();
    const HOST = "0.0.0.0";

    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server listening on PORT=${PORT}`);
      console.log("🚀 All services ready to accept requests");
    });

    // Extra services
    initializePushNotifications(server);
    initializePackageSync(server);
    new ChatWebSocketServer(server);
    console.log("💬 Chat WebSocket server initialized");

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`⚠️  Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("🛑 HTTP server closed. Bye!");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    console.log("🔄 Retrying in 5 seconds...");
    setTimeout(startServer, 5000);
  }
}

startServer();
