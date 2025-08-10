// server/middleware/cors.ts
import type { Express, Request, Response, NextFunction } from "express";

/** Read allowlist from env (comma-separated) or fallback defaults */
function getAllowlist(): Set<string> {
  const fromEnv =
    process.env.ORIGIN_WHITELIST?.split(",").map(s => s.trim()).filter(Boolean) ?? [];

  const defaults = [
    "https://ashishproperty.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  const list = new Set<string>([...defaults, ...fromEnv]);
  return list;
}

function setCorsHeaders(req: Request, res: Response, allowlist: Set<string>) {
  const origin = (req.headers.origin || "").replace(/\/+$/, ""); // trim trailing slash
  if (origin && allowlist.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

/**
 * Install global CORS + preflight handlers at the very top.
 * Also adds an explicit OPTIONS route for * to be extra safe.
 */
export function installCors(app: Express, opts?: { log?: boolean }) {
  const allowlist = getAllowlist();
  const shouldLog = !!opts?.log;

  // Tiny logger to prove OPTIONS reaches app
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (shouldLog && (req.method === "OPTIONS" || req.path.startsWith("/api/"))) {
      console.log("🔎 INCOMING", req.method, req.originalUrl, "origin=", req.headers.origin);
    }
    next();
  });

  // Global CORS + instant preflight
  app.use((req: Request, res: Response, next: NextFunction) => {
    setCorsHeaders(req, res, allowlist);
    if (req.method === "OPTIONS") return res.sendStatus(204); // short-circuit preflight
    next();
  });

  // Safety net: explicit OPTIONS for any path
  app.options("*", (req: Request, res: Response) => {
    setCorsHeaders(req, res, allowlist);
    return res.sendStatus(204);
  });

  // Optional: add a cheap probe to test CORS without DB/auth
  app.get("/api/_cors", (_req: Request, res: Response) => res.json({ ok: true }));
}
