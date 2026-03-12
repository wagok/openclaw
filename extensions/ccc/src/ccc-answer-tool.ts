import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { assertSessionAllowed, resolveConfig } from "./config.js";
import { execCccCommand } from "./ssh-exec.js";

export function createCccAnswerTool(api: OpenClawPluginApi) {
  return {
    name: "ccc_answer",
    label: "CCC Answer",
    description: [
      "Answer a pending interactive question in a CCC session by selecting an option.",
      "First use ccc_questions to see pending questions and their options.",
      "Sends the appropriate key sequences to Claude's UI to select the chosen option.",
      "When all questions in a set are answered, automatically submits.",
    ].join(" "),
    parameters: Type.Object({
      session: Type.String({ description: "CCC session name." }),
      question_index: Type.Number({ description: "Which question to answer (0-based index)." }),
      option_index: Type.Number({ description: "Which option to select (0-based index)." }),
    }),

    async execute(
      _id: string,
      params: { session: string; question_index: number; option_index: number },
    ) {
      const cfg = resolveConfig(api);
      const session = params.session;

      if (!session?.trim()) {
        throw new Error("session is required");
      }
      if (typeof params.question_index !== "number" || params.question_index < 0) {
        throw new Error("question_index is required (0-based)");
      }
      if (typeof params.option_index !== "number" || params.option_index < 0) {
        throw new Error("option_index is required (0-based)");
      }

      assertSessionAllowed(cfg, session);

      const response = await execCccCommand(
        api,
        cfg,
        {
          cmd: "answer",
          session,
          question_index: params.question_index,
          option_index: params.option_index,
        },
        30_000,
      );

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    },
  };
}
