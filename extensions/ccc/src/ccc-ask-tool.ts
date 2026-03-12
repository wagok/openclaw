import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccAskTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_ask",
    label: "CCC Ask",
    description: [
      "Send a message to a CCC (Claude Code Chat) session and wait for Claude's response (blocking).",
      "Returns the response text and a message_id you can use with ccc_history(after=message_id) for follow-up context.",
      "Blocks until Claude responds or timeout. For long tasks, prefer ccc_send + ccc_history.",
      "Do not send concurrent asks to the same session.",
      "If this times out, the response may still arrive — use ccc_history(from_filter='claude') to check.",
    ].join(" "),
    parameters: Type.Object({
      session: Type.String({ description: "Target CCC session name." }),
      text: Type.String({ description: "Message text to send to Claude." }),
      from: Type.Optional(Type.String({ description: "Sender name (default: config defaultFrom)." })),
      timeoutMs: Type.Optional(
        Type.Number({ description: "Custom timeout in ms (default: config askTimeoutMs, usually 60s)." }),
      ),
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
      const timeout =
        typeof params.timeoutMs === "number" && params.timeoutMs > 0
          ? params.timeoutMs
          : cfg.askTimeoutMs;

      // SSH timeout should be slightly longer than the CCC ask timeout
      const sshTimeout = timeout + 5_000;

      const response = await execCccCommand(
        api,
        cfg,
        { cmd: "ask", session, text, from, timeoutMs: timeout },
        sshTimeout,
      );

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
