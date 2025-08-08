// server/start-server.ts
import { createServer, initializePushNotifications, initializePackageSync } from "./index";
import { ChatWebSocketServer } from "./websocket";
import { connectToDatabase } from "./db/mongodb";

async function startServer() {
  try {
    console.log("🔄 Initializing database connection...");
    await connectToDatabase();
    console.log("✅ Database connection established");

    const app = createServer();

    // Railway always sets PORT env. Don't fallback to 8080 here.
    const raw = process.env.PORT;
    const PORT = raw ? Number(raw) : NaN;
    if (!PORT || Number.isNaN(PORT)) {
      console.error("❌ PORT env missing. Railway needs the app to listen on PORT.");
      process.exit(1);
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server listening on PORT=${PORT}`);
      console.log("🚀 All services ready to accept requests");
    });

    initializePushNotifications(server);
    initializePackageSync(server);
    new ChatWebSocketServer(server);
    console.log("💬 Chat WebSocket server initialized");
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    console.log("🔄 Retrying in 5 seconds...");
    setTimeout(startServer, 5000);
  }
}

startServer();
