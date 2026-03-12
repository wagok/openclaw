import http from "node:http";
import type { PluginRuntime } from "openclaw/plugin-sdk";
import type { ResolvedCccWebhookConfig } from "./config.js";
import type { CccWebhookPayload } from "./webhook-dispatch.js";
import { dispatchWebhookEvent } from "./webhook-dispatch.js";
import { shouldForward } from "./webhook-filter.js";

const MAX_BODY = 64 * 1024;

export class CccWebhookServer {
  private server: http.Server | null = null;
  private config: ResolvedCccWebhookConfig;
  private runtime: PluginRuntime;

  constructor(config: ResolvedCccWebhookConfig, runtime: PluginRuntime) {
    this.config = config;
    this.runtime = runtime;
  }

  async start(): Promise<void> {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    this.server = server;

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(this.config.port, this.config.bind, () => {
        server.removeListener("error", reject);
        resolve();
      });
    });

    console.log(`[ccc-webhook] Listening on ${this.config.bind}:${this.config.port}`);
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    const s = this.server;
    this.server = null;
    await new Promise<void>((resolve) => s.close(() => resolve()));
    console.log("[ccc-webhook] Server stopped");
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (req.method !== "POST" || req.url !== "/ccc-event") {
      res.writeHead(req.method !== "POST" ? 405 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    if (this.config.token) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${this.config.token}`) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
    }

    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (res.writableEnded) return;

      let payload: CccWebhookPayload;
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      if (!payload.event || !payload.session || !payload.from || !payload.timestamp) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields: event, session, from, timestamp" }));
        return;
      }

      if (!shouldForward(payload.session, payload.messageId)) {
        console.log(`[ccc-webhook] Filtered event for session "${payload.session}" (masked or already seen)`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, filtered: true }));
        return;
      }

      try {
        dispatchWebhookEvent(this.runtime, payload);
        console.log(`[ccc-webhook] Dispatched event: session="${payload.session}" from=${payload.from}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error("[ccc-webhook] Dispatch error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal error" }));
      }
    });
  }
}
