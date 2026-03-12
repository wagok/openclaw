import type { PluginRuntime } from "openclaw/plugin-sdk";

export type CccWebhookPayload = {
  event: string;
  session: string;
  from: string;
  timestamp: string;
  messageId?: number;
  preview?: string;
};

/** Derive main session key from config without importing internal modules (jiti safety). */
function getMainSessionKey(cfg: Record<string, unknown>): string {
  const session = cfg.session as { scope?: string; mainKey?: string } | undefined;
  if (session?.scope === "global") return "global";
  const agents = (cfg.agents as { list?: Array<{ id?: string; default?: boolean }> } | undefined)
    ?.list ?? [];
  const defaultId = agents.find((a) => a?.default)?.id ?? agents[0]?.id ?? "main";
  const agentId = (defaultId || "main").trim().toLowerCase() || "main";
  const mainKey = (session?.mainKey || "main").trim().toLowerCase() || "main";
  return `agent:${agentId}:${mainKey}`;
}

export function dispatchWebhookEvent(runtime: PluginRuntime, payload: CccWebhookPayload): void {
  const preview = payload.preview
    ? payload.preview.length > 200
      ? payload.preview.slice(0, 200) + "…"
      : payload.preview
    : "(no preview)";

  const text = `[CCC] New message in session "${payload.session}" from ${payload.from}: ${preview}`;
  const contextKey = `ccc:webhook:${payload.session}:${payload.messageId ?? payload.timestamp}`;

  const cfg = runtime.config.loadConfig() as Record<string, unknown>;
  const sessionKey = getMainSessionKey(cfg);

  runtime.system.enqueueSystemEvent(text, { sessionKey, contextKey });
  runtime.system.requestHeartbeatNow({ reason: "hook:ccc-webhook" });
}
