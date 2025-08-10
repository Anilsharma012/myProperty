// vite.config.server.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      // ✅ server ko yahin se start karna hai (index.ts sirf createServer return kare)
      entry: path.resolve(__dirname, "server/start-server.ts"),
      name: "server",
      fileName: () => "start-server", // output name without extension
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node built-ins
        "fs", "path", "url", "http", "https", "os", "crypto",
        "stream", "util", "events", "buffer", "querystring", "child_process",
        // External deps (keep out of bundle)
        "express", "cors",
      ],
      output: {
        format: "es",
        entryFileNames: "start-server.ts", // ✅ final file name
      },
    },
    minify: false,     // debugging friendly
    sourcemap: true,
    // emptyOutDir: false, // (optional) agar dist/ share ho raha ho
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
