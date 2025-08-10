// vite.config.server.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    ssr: true,
    outDir: "dist/server",
    target: "node18",                 // ← Railway logs: Node v18.20.5
    lib: {
      entry: path.resolve(__dirname, "server/start-server.ts"),
      name: "server",
      fileName: () => "start-server",
      formats: ["es"],                // ESM output
    },
    rollupOptions: {
      // Jo packages runtime pe Node se load honge, bundle se bahar rakhe
      external: [
        // Node built-ins
        "fs","path","url","http","https","os","crypto","stream",
        "util","events","buffer","querystring","child_process",
        // Common externals
        "express","cors","mongoose","ws","cookie-parser","jsonwebtoken",
      ],
      output: {
        format: "es",
        entryFileNames: "start-server.mjs", // ← final file name we will run
      },
    },
    minify: false,
    sourcemap: true,
    emptyOutDir: false,               // monorepo/shared dist ko wipe na kare
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
