// server/middleware/cors.ts
import type {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

/** Read allowlist from env (comma-separated) or fallback defaults */
function getAllowlist(): Set<string> {
  const fromEnv =
    process.env.ORIGIN_WHITELIST?.split(",").map(s => s.trim()).filter(Boolean) ?? [];
  const defaults = [
    "https://ashishproperty.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  return new Set<string>([...defaults, ...fromEnv]);
}

function setCorsHeaders(req: ExpressRequest, res: ExpressResponse, allowlist: Set<string>) {
  const originRaw = (req.headers.origin ?? "") as string;
  const origin = originRaw.replace(/\/+$/, ""); // trim trailing slash

  // debug header (for inspection in Network tab)
  res.header("X-CORS-DEBUG", `method=${req.method};url=${req.originalUrl};origin=${origin}`);

  if (origin && allowlist.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
  res.header("Access-Control-Max-Age", "86400");
}

/** Install global CORS + preflight handlers at the very top. */
export function installCors(app: Express, opts?: { log?: boolean }) {
  const allowlist = getAllowlist();
  const shouldLog = !!opts?.log;

  app.use((req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
    if (shouldLog && (req.method === "OPTIONS" || req.path.startsWith("/api/"))) {
      console.log("🔎 INCOMING", req.method, req.originalUrl, "origin=", req.headers.origin);
    }
    next();
  });

  app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    setCorsHeaders(req, res, allowlist);
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.options("*", (req: ExpressRequest, res: ExpressResponse) => {
    setCorsHeaders(req, res, allowlist);
    return res.sendStatus(204);
  });

  app.get("/api/_cors", (_req: ExpressRequest, res: ExpressResponse) => res.json({ ok: true }));
}
