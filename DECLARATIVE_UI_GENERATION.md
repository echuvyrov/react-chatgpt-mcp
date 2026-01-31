# Declarative UI Generation

This repository now includes a declarative UI JSON generation pattern that uses ChatGPT to generate dashboard UIs from natural language prompts.

## Overview

The system uses:
- A comprehensive system prompt that instructs ChatGPT on how to generate valid dashboard JSON
- A JSON Schema (PAGE_SCHEMA) that validates the structure
- AJV for runtime validation
- The declarative-ui-core renderer to display the generated UI

## Quick Start

### 1. Set up environment

```bash
export OPENAI_API_KEY="your-api-key-here"
npm install
npm run build:widget
npm run dev
```

### 2. Use the MCP tool

The `generate_declarative_ui` tool is available via the MCP server at `/api/mcp`.

**Tool Parameters:**
- `prompt` (required): Natural language description of the desired dashboard
- `keepExisting` (optional): If true, keeps existing components and adds to them

**Example prompts:**
```
"Create a dashboard with a bar chart showing sales by region"
"Build me a widget that shows incident volume by assignment group"
"Add a map showing office locations in New York, London, and Tokyo"
"Create a line chart showing revenue trends over the last 12 months"
```

### 3. Test via API endpoint

For development/testing, use the test endpoint:

```bash
curl -X POST http://localhost:3000/api/test-generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple dashboard with a bar chart"}'
```

## Architecture

### Module Structure

```
pages/api/declarativeUi/
├── schema.ts          # PAGE_SCHEMA JSON Schema definition
├── prompt.ts          # System prompt for ChatGPT
├── validator.ts       # AJV-based validation
├── generator.ts       # Main generation function
├── types.ts           # TypeScript types
├── index.ts           # Public API exports
├── example.ts         # Example usage code
└── README.md          # Detailed documentation
```

### How It Works

1. **User provides natural language prompt**
   - Example: "Build me a widget showing incident volume by assignment group"

2. **System constructs ChatGPT request**
   - System message: Comprehensive prompt with schema and rules
   - User message: Current page JSON + user's request
   - Model: gpt-4o with temperature=0 for consistency

3. **ChatGPT generates JSON**
   - Returns a complete page JSON with layout, components, and data
   - Follows the schema structure and rules

4. **Validation**
   - Parse JSON safely
   - Validate against PAGE_SCHEMA using AJV
   - Return errors if validation fails

5. **Render UI**
   - If valid, update the widget with the new JSON
   - The declarative-ui-core renderer displays the components

## Supported Component Types

- **vegalite5** - Charts using Vega-Lite v5 (bar, line, area, scatter, etc.)
- **map** - MapLibre GL JS maps with data points
- **table** - Tabular data with configurable columns
- **list** - Simple list view of data
- **form** - Form components
- **markdown** - Markdown-formatted text content
- **mermaid** - Diagrams (flowcharts, sequence diagrams, etc.)

## Example Usage

### Programmatic Usage

```typescript
import { generateDeclarativeUiJson } from './pages/api/declarativeUi';

const result = await generateDeclarativeUiJson({
  userPrompt: "Create a dashboard with sales metrics",
  currentPage: null,
  apiKey: process.env.OPENAI_API_KEY,
  signal: abortController.signal // optional
});

if (result.ok) {
  console.log("Generated UI:", result.uiJson);
  // Use result.uiJson to render the widget
} else {
  console.error("Error:", result.error);
}
```

### Via MCP Tool (from ChatGPT)

When connected to the MCP server, ChatGPT can call:

```
generate_declarative_ui({
  prompt: "Build a dashboard showing incident metrics",
  keepExisting: false
})
```

The UI will automatically render in the chat interface.

## Updating the System

### To modify the system prompt:

Edit `pages/api/declarativeUi/prompt.ts` and update the `getSystemPrompt()` function.

### To modify the schema:

Edit `pages/api/declarativeUi/schema.ts` and update the `PAGE_SCHEMA` constant.

**Important:** Keep the schema synchronized with the declarative-ui repository to ensure compatibility.

## Error Handling

The generator returns a discriminated union:

```typescript
type GenerateResult =
  | { ok: true; uiJson: Page }
  | { ok: false; error: string; raw?: string };
```

Common errors:
- Missing API key
- Empty prompt
- Invalid JSON from ChatGPT
- Schema validation failures
- OpenAI API errors

## Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Use curl or Postman to test the endpoint:

```bash
curl -X POST http://localhost:3000/api/test-generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a bar chart showing quarterly sales"
  }'
```

### Example Test Prompts

```
"Create a simple dashboard with a bar chart showing sales by month"
"Build me a widget that shows incident volume by assignment group with filters for last 7/30/90 days"
"Create a map showing office locations in New York, London, and Tokyo"
"Make a dashboard with a markdown header saying 'Sales Dashboard' and a line chart showing revenue trends"
"Add a table showing top 10 customers by revenue"
"Create a mermaid flowchart showing the incident resolution process"
```

## Acceptance Criteria ✓

- [x] Natural language prompts generate valid schema-conformant JSON
- [x] Schema validation prevents malformed JSON from breaking the UI
- [x] Errors are user-friendly and don't crash the app
- [x] The ported prompt/schema are not duplicated across multiple files
- [x] System prompt and schema are in dedicated, maintainable modules
- [x] Validation uses existing patterns (zod for MCP tool, ajv for JSON schema)
- [x] UI widget renders from generated JSON
- [x] Test endpoint available for verification

## Next Steps

1. Build the widget: `npm run build:widget`
2. Start the dev server: `npm run dev`
3. Test with the MCP tool or test endpoint
4. Iterate on prompts to refine the system prompt if needed
