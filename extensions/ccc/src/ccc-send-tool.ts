import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccSendTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_send",
    label: "CCC Send",
    description: [
      "Send a message to a CCC (Claude Code Chat) session without waiting for a response (non-blocking, fire-and-forget).",
      "Returns a message_id of the sent message. To get Claude's response later, use ccc_history(after=message_id, from_filter='claude').",
      "Use this for long-running tasks where you don't want to block.",
    ].join(" "),
    parameters: Type.Object({
      session: Type.String({ description: "Target CCC session name." }),
      text: Type.String({ description: "Message text to send." }),
      from: Type.Optional(Type.String({ description: "Sender name (default: config defaultFrom)." })),
    }),

    async execute(_id: string, params: Record<string, unknown>) {
      const cfg = resolveConfig(api);
      const session = params.session as string;
      const text = params.text as string;

      if (!session?.trim()) {
        throw new Error("session is required");
      }
      if (!text?.trim()) {
        throw new Error("text is required");
      }

      assertSessionAllowed(cfg, session);

      const from = (params.from as string)?.trim() || cfg.defaultFrom;

      const response = await execCccCommand(
        api,
        cfg,
        { cmd: "send", session, text, from },
        30_000,
      );

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
