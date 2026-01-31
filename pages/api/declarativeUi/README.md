# Declarative UI Generator Module

This module implements the declarative UI JSON generation pattern, where a system prompt + JSON schema is used to call ChatGPT and return a JSON object that drives a declarative UI widget.

## Architecture

The module is organized into the following files:

- **`schema.ts`** - Contains the PAGE_SCHEMA JSON Schema definition that validates the UI structure
- **`prompt.ts`** - Contains the system prompt that instructs ChatGPT on how to generate valid UI JSON
- **`validator.ts`** - Provides JSON schema validation using AJV
- **`generator.ts`** - Main function that calls ChatGPT and validates the response
- **`types.ts`** - TypeScript type definitions
- **`index.ts`** - Public API exports

## Usage

### Via MCP Tool (Recommended)

The `generate_declarative_ui` MCP tool is available and can be called from ChatGPT:

```
Tool: generate_declarative_ui
Parameters:
  - prompt: "Build me a widget that shows incident volume by assignment group with filters for last 7/30/90 days"
  - keepExisting: false (optional, default: false)
```

The tool will:
1. Call ChatGPT with the system prompt and user's natural language request
2. Validate the returned JSON against the schema
3. Render the UI widget automatically

### Programmatic Usage

```typescript
import { generateDeclarativeUiJson } from './pages/api/declarativeUi';

const result = await generateDeclarativeUiJson({
  userPrompt: "Create a dashboard with a bar chart showing sales by region",
  currentPage: null, // or existing page to modify
  apiKey: process.env.OPENAI_API_KEY,
  signal: abortController.signal // optional
});

if (result.ok) {
  console.log("Generated UI:", result.uiJson);
} else {
  console.error("Error:", result.error);
  if (result.raw) {
    console.log("Raw response:", result.raw);
  }
}
```

## Updating the Prompt or Schema

### To update the system prompt:

Edit `pages/api/declarativeUi/prompt.ts` and modify the `getSystemPrompt()` function. The prompt is a template string that includes the schema JSON and detailed rules for generating valid UI.

### To update the schema:

Edit `pages/api/declarativeUi/schema.ts` and modify the `PAGE_SCHEMA` constant. This schema should match the structure expected by the declarative-ui-core renderer.

**IMPORTANT:** Keep the schema synchronized with the one in `declarative-ui` repository to ensure compatibility.

## Schema Overview

The PAGE_SCHEMA defines a dashboard structure with:

- **layout** - Grid layout configuration (using react-grid-layout)
  - `engine`: "rgl" (react-grid-layout)
  - `cols`: number of columns (default: 24)
  - `rowHeight`: height of each row in pixels
  - `items`: array of grid items with position (x, y) and size (w, h)

- **components** - Map of component definitions
  - Supported types: `vegalite5`, `map`, `list`, `form`, `table`, `markdown`, `mermaid`
  - Each component has a `type`, optional `title`, `dataRef`, `config`, and/or `spec`

- **data** - Map of inline datasets
  - Each dataset has `source: "inline"` and `rows: []` array

## Error Handling

The generator returns a discriminated union type:

```typescript
type GenerateResult =
  | { ok: true; uiJson: Page }
  | { ok: false; error: string; raw?: string };
```

Errors can occur due to:
- Missing or invalid API key
- Empty user prompt
- OpenAI API failures
- Invalid JSON in response
- Schema validation failures
- Request cancellation (via AbortSignal)

## Testing

To test the generator with a sample prompt:

1. Set `OPENAI_API_KEY` environment variable
2. Start the dev server: `npm run dev`
3. Use the MCP tool from ChatGPT or call the API programmatically

Example test prompt:
```
"Build me a widget that shows incident volume by assignment group with filters for last 7/30/90 days"
```

Expected behavior:
- ChatGPT generates valid JSON conforming to PAGE_SCHEMA
- Schema validation passes
- UI widget renders with the requested components
