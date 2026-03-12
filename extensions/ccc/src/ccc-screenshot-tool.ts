import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccScreenshotTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_screenshot",
    label: "CCC Screenshot",
    description:
      "Capture a raw tmux screenshot of a CCC session. Returns the current terminal content (capture-pane output). Useful for checking what Claude is doing right now without waiting for a response.",
    parameters: Type.Object({
      session: Type.String({ description: "CCC session name" }),
      limit: Type.Optional(
        Type.Number({ description: "Max lines to capture (default: 50)" }),
      ),
    }),

    async execute(_id: string, params: { session: string; limit?: number }) {
      const cfg = resolveConfig(api);
      assertSessionAllowed(cfg, params.session);

      const request: Record<string, unknown> & { cmd: string } = {
        cmd: "screenshot",
        session: params.session,
      };
      if (typeof params.limit === "number" && params.limit > 0) {
        request.limit = params.limit;
      }

      const response = await execCccCommand(api, cfg, request, 30_000);

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
