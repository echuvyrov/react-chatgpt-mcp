import type { NextApiRequest, NextApiResponse } from "next";
import { generateDeclarativeUiJson } from "./declarativeUi";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY not configured" });
    return;
  }

  const { prompt, keepExisting } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid 'prompt' parameter" });
    return;
  }

  try {
    const result = await generateDeclarativeUiJson({
      userPrompt: prompt,
      currentPage: keepExisting ? null : null,
      apiKey
    });

    if (result.ok) {
      res.status(200).json({
        success: true,
        uiJson: result.uiJson,
        componentCount: Object.keys(result.uiJson.components).length,
        layoutItemCount: result.uiJson.layout.items.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        raw: result.raw
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Unexpected error: ${msg}` });
  }
}
