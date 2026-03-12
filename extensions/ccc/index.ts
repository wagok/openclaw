import type {
  AnyAgentTool,
  OpenClawPluginApi,
  OpenClawPluginToolFactory,
} from "openclaw/plugin-sdk";
import { createCccActivityTool } from "./src/ccc-activity-tool.js";
import { createCccAnswerTool } from "./src/ccc-answer-tool.js";
import { createCccAskTool } from "./src/ccc-ask-tool.js";
import { createCccContinueTool } from "./src/ccc-continue-tool.js";
import { createCccHistoryTool } from "./src/ccc-history-tool.js";
import { createCccPingTool } from "./src/ccc-ping-tool.js";
import { createCccQuestionsTool } from "./src/ccc-questions-tool.js";
import { createCccScreenshotTool } from "./src/ccc-screenshot-tool.js";
import { createCccSendTool } from "./src/ccc-send-tool.js";
import { createCccSessionsTool } from "./src/ccc-sessions-tool.js";
import { resolveConfig } from "./src/config.js";
import { CccWebhookServer } from "./src/webhook-server.js";

export default function register(api: OpenClawPluginApi) {
  const toolFactory: OpenClawPluginToolFactory = (ctx) => {
    if (ctx.sandboxed) {
      return null;
    }
    return [
      createCccPingTool(api),
      createCccSessionsTool(api),
      createCccAskTool(api),
      createCccSendTool(api),
      createCccContinueTool(api),
      createCccHistoryTool(api),
      createCccScreenshotTool(api),
      createCccQuestionsTool(api),
      createCccAnswerTool(api),
      createCccActivityTool(api),
    ] as AnyAgentTool[];
  };

  api.registerTool(toolFactory, {
    names: ["ccc_ping", "ccc_sessions", "ccc_ask", "ccc_send", "ccc_continue", "ccc_history", "ccc_screenshot", "ccc_questions", "ccc_answer", "ccc_activity"],
  });

  let webhookServer: CccWebhookServer | null = null;

  api.registerService({
    id: "ccc-webhook",
    start: async () => {
      let cfg;
      try {
        cfg = resolveConfig(api);
      } catch {
        return;
      }
      if (!cfg.webhook.enabled) return;

      webhookServer = new CccWebhookServer(cfg.webhook, api.runtime);
      try {
        await webhookServer.start();
      } catch (err) {
        console.error("[ccc-webhook] Failed to start:", err);
        webhookServer = null;
      }
    },
    stop: async () => {
      if (webhookServer) {
        await webhookServer.stop();
        webhookServer = null;
      }
    },
  });
}
