import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccActivityTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_activity",
    label: "CCC Activity",
    description: [
      "Get last message summary for all CCC sessions in a single call.",
      "Returns lastMessageId, timestamp, sender, and truncated text for each session.",
      "Use to detect new activity across sessions without calling ccc_history per session.",
      "Compare lastMessageId with a saved value to find sessions with new messages.",
    ].join(" "),
    parameters: Type.Object({}),

    async execute(_id: string, _params: Record<string, unknown>) {
      const cfg = resolveConfig(api);
      const response = await execCccCommand(api, cfg, { cmd: "activity" }, 30_000);

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
