import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import type { CccRequest } from "./ssh-exec.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccHistoryTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_history",
    label: "CCC History",
    description: [
      "Read message history from a CCC (Claude Code Chat) session.",
      "Supports pagination via 'after' (message_id) and 'limit'.",
      "Use from_filter to get only messages from a specific sender: 'human', 'claude', or 'api'.",
      "Common pattern: after ccc_send, save the message_id, then later call ccc_history(after=id, from_filter='claude') to get Claude's response.",
    ].join(" "),
    parameters: Type.Object({
      session: Type.String({ description: "Target CCC session name." }),
      after: Type.Optional(
        Type.Number({ description: "Return messages after this message_id (for pagination)." }),
      ),
      limit: Type.Optional(
        Type.Number({ description: "Max number of messages to return." }),
      ),
      from_filter: Type.Optional(
        Type.String({ description: "Filter by sender: 'human', 'claude', or 'api'." }),
      ),
    }),

    async execute(_id: string, params: Record<string, unknown>) {
      const cfg = resolveConfig(api);
      const session = params.session as string;

      if (!session?.trim()) {
        throw new Error("session is required");
      }

      assertSessionAllowed(cfg, session);

      const request: CccRequest = { cmd: "history", session };

      if (typeof params.after === "number") {
        request.after = params.after;
      }
      if (typeof params.limit === "number" && params.limit > 0) {
        request.limit = params.limit;
      }
      if (typeof params.from_filter === "string" && params.from_filter.trim()) {
        request.from_filter = params.from_filter.trim();
      }

      const response = await execCccCommand(api, cfg, request, 30_000);

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
