import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccSessionsTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_sessions",
    label: "CCC Sessions",
    description:
      "List all CCC (Claude Code Chat) sessions with their status, working directory, and last activity time. Use to discover available sessions and check if a session is idle before sending a task.",
    parameters: Type.Object({}),

    async execute(_id: string, _params: Record<string, unknown>) {
      const cfg = resolveConfig(api);
      const response = await execCccCommand(api, cfg, { cmd: "sessions" }, 30_000);

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
