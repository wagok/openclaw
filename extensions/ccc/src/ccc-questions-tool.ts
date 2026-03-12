import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccQuestionsTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_questions",
    label: "CCC Questions",
    description: [
      "Get pending interactive questions (AskUserQuestion) for a CCC session.",
      "When Claude asks a multiple-choice question, it appears here.",
      "Returns question text, options with labels/descriptions, and whether each question is already answered.",
      "Questions expire after 5 minutes. Use ccc_answer to respond.",
    ].join(" "),
    parameters: Type.Object({
      session: Type.String({ description: "CCC session name." }),
    }),

    async execute(_id: string, params: { session: string }) {
      const cfg = resolveConfig(api);
      const session = params.session;

      if (!session?.trim()) {
        throw new Error("session is required");
      }

      assertSessionAllowed(cfg, session);

      const response = await execCccCommand(
        api,
        cfg,
        { cmd: "questions", session },
        30_000,
      );

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
