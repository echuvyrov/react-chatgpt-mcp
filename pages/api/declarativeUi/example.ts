import { generateDeclarativeUiJson } from "./generator";

export async function testGenerateUI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("OPENAI_API_KEY not set");
    return;
  }

  const testPrompts = [
    "Create a simple dashboard with a bar chart showing sales by month",
    "Build me a widget that shows incident volume by assignment group with filters for last 7/30/90 days",
    "Create a map showing office locations in New York, London, and Tokyo",
    "Make a dashboard with a markdown header saying 'Sales Dashboard' and a line chart showing revenue trends"
  ];

  for (const prompt of testPrompts) {
    console.log(`\n=== Testing prompt: "${prompt}" ===`);
    
    const result = await generateDeclarativeUiJson({
      userPrompt: prompt,
      currentPage: null,
      apiKey
    });

    if (result.ok) {
      console.log("✓ Success! Generated UI with components:", Object.keys(result.uiJson.components));
      console.log("  Layout items:", result.uiJson.layout.items.length);
    } else {
      console.error("✗ Failed:", result.error);
      if (result.raw) {
        console.log("  Raw response preview:", result.raw.substring(0, 200));
      }
    }
  }
}
