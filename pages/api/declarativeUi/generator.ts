import OpenAI from "openai";
import type { Page } from "declarative-ui-core";
import { getSystemPrompt } from "./prompt";
import { validatePageJson } from "./validator";
import type { GenerateResult, GenerateOptions } from "./types";

function safeJsonParse(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

export async function generateDeclarativeUiJson(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { userPrompt, currentPage, apiKey, signal } = options;

  if (!apiKey?.trim()) {
    return {
      ok: false,
      error: "Missing OpenAI API key"
    };
  }

  const userText = userPrompt.trim();
  if (!userText) {
    return {
      ok: false,
      error: "User prompt cannot be empty"
    };
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = getSystemPrompt();

  const currentPageJson = currentPage ?? {};
  const userMessage = `Current page JSON:\n${JSON.stringify(currentPageJson, null, 2)}\n\nUser request:\n${userText}\n\nReturn the updated full page JSON only.`;

  try {
    const response = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      },
      { signal }
    );

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return {
        ok: false,
        error: "OpenAI response missing message content"
      };
    }

    let parsed: unknown;
    try {
      parsed = safeJsonParse(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        error: `Assistant returned invalid JSON: ${msg}`,
        raw: content
      };
    }

    const validation = validatePageJson(parsed);
    if (!validation.valid) {
      return {
        ok: false,
        error: `Schema validation failed:\n${JSON.stringify(validation.errors ?? [], null, 2)}`,
        raw: content
      };
    }

    return {
      ok: true,
      uiJson: parsed as Page
    };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        ok: false,
        error: "Request was cancelled"
      };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `OpenAI request failed: ${msg}`
    };
  }
}
