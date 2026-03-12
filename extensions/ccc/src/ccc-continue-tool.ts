import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccContinueTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_continue",
    label: "CCC Continue",
    description:
      "Restart a crashed or stuck CCC (Claude Code Chat) session. Kills the existing tmux session and creates a new one with 'claude --dangerously-skip-permissions -c'. Use when a session is unresponsive or has exited.",
    parameters: Type.Object({
      session: Type.String({ description: "CCC session name to restart." }),
      from: Type.Optional(Type.String({ description: "Sender name for Telegram notification (default: config defaultFrom)." })),
    }),

    async execute(_id: string, params: { session: string; from?: string }) {
      const cfg = resolveConfig(api);
      const session = params.session;

      if (!session?.trim()) {
        throw new Error("session is required");
      }

      assertSessionAllowed(cfg, session);

      const from = params.from?.trim() || cfg.defaultFrom;

      const response = await execCccCommand(
        api,
        cfg,
        { cmd: "continue", session, from },
        60_000,
      );

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
