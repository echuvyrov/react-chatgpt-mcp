import type { Page } from "declarative-ui-core";

export type GenerateResult =
  | { ok: true; uiJson: Page }
  | { ok: false; error: string; raw?: string };

export interface GenerateOptions {
  userPrompt: string;
  currentPage?: Page | null;
  apiKey?: string;
  signal?: AbortSignal;
}
