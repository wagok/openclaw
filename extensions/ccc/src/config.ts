import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

export type CccWebhookConfig = {
  enabled?: boolean;
  port?: number;
  bind?: string;
  token?: string;
};

export type ResolvedCccWebhookConfig = {
  enabled: boolean;
  port: number;
  bind: string;
  token: string | undefined;
};

export type CccPluginConfig = {
  sshHost?: string;
  sshPort?: number;
  sshIdentityFile?: string;
  socketPath?: string;
  defaultFrom?: string;
  askTimeoutMs?: number;
  sessionAllowlist?: string[];
  webhook?: CccWebhookConfig;
};

export type ResolvedCccConfig = {
  sshHost: string;
  sshPort: number;
  sshIdentityFile?: string;
  socketPath: string;
  defaultFrom: string;
  askTimeoutMs: number;
  sessionAllowlist: string[];
  webhook: ResolvedCccWebhookConfig;
};

export function resolveConfig(api: OpenClawPluginApi): ResolvedCccConfig {
  const raw = (api.pluginConfig ?? {}) as CccPluginConfig;

  const sshHost = raw.sshHost?.trim();
  if (!sshHost) {
    throw new Error("ccc: sshHost is required in plugin config");
  }

  return {
    sshHost,
    sshPort: typeof raw.sshPort === "number" && raw.sshPort > 0 ? raw.sshPort : 22,
    sshIdentityFile: raw.sshIdentityFile?.trim() || undefined,
    // socketPath must be an absolute path on the REMOTE machine (where CCC runs).
    // Do NOT use ~ here — the OpenClaw framework expands tildes against the LOCAL home dir.
    socketPath: raw.socketPath?.trim() || "/home/wlad/.ccc.sock",
    defaultFrom: raw.defaultFrom?.trim() || "openclaw",
    askTimeoutMs:
      typeof raw.askTimeoutMs === "number" && raw.askTimeoutMs > 0 ? raw.askTimeoutMs : 60_000,
    sessionAllowlist: Array.isArray(raw.sessionAllowlist) ? raw.sessionAllowlist : [],
    webhook: resolveWebhookConfig(raw.webhook),
  };
}

export function resolveWebhookConfig(raw?: CccWebhookConfig): ResolvedCccWebhookConfig {
  const wh = raw ?? {};
  let bind = "127.0.0.1";
  if (wh.bind) {
    const b = wh.bind.trim().toLowerCase();
    if (b === "lan") bind = "0.0.0.0";
    else if (b === "localhost") bind = "127.0.0.1";
    else bind = wh.bind.trim();
  }
  return {
    enabled: wh.enabled === true,
    port: typeof wh.port === "number" && wh.port > 0 ? wh.port : 18790,
    bind,
    token: wh.token?.trim() || undefined,
  };
}

export function assertSessionAllowed(cfg: ResolvedCccConfig, session: string): void {
  if (cfg.sessionAllowlist.length > 0 && !cfg.sessionAllowlist.includes(session)) {
    throw new Error(
      `Session '${session}' is not in the allowlist. Allowed: ${cfg.sessionAllowlist.join(", ")}`,
    );
  }
}
