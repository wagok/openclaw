import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccPingTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_ping",
    label: "CCC Ping",
    description:
      "Health check for the CCC (Claude Code Chat) bridge. Returns version, uptime, and active session count. Use this to verify CCC is reachable before sending tasks.",
    parameters: Type.Object({}),

    async execute(_id: string, _params: Record<string, unknown>) {
      const cfg = resolveConfig(api);
      const response = await execCccCommand(api, cfg, { cmd: "ping" }, 30_000);

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
