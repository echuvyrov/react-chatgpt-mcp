import type { NextApiRequest, NextApiResponse } from "next";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { generateDeclarativeUiJson } from "../declarativeUi";

export const config = {
  api: {
    bodyParser: false
  }
};

const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
const WIDGET_URI = "ui://widget/declarative-ui.html";
const WIDGET_RESOURCE_NAME = "generate_declarative_ui";
const widgetPath = path.join(process.cwd(), "public", "widget", "index.html");

let currentComponentData: any = null;

function loadWidgetHtml() {
  if (!existsSync(widgetPath)) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Declarative UI Widget</title>
  </head>
  <body>
    <div style="padding:24px;font-family:system-ui">Run <code>npm run build:widget</code> to generate the React widget.</div>
  </body>
</html>`;
  }

  let html = readFileSync(widgetPath, "utf8");
  
  if (currentComponentData) {
    const dataScript = `<script>window.__COMPONENT_DATA__ = ${JSON.stringify(currentComponentData)};</script>`;
    html = html.replace('</head>', `${dataScript}</head>`);
  }
  
  return html;
}

function createDeclarativeUIServer() {
  const server = new McpServer({ name: "declarative-ui", version: "0.1.0" });

  server.registerResource(WIDGET_RESOURCE_NAME, WIDGET_URI, {}, async () => {
    const widgetHtml = loadWidgetHtml();
    return {
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: "text/html+skybridge",
          text: widgetHtml,
          _meta: { "openai/widgetPrefersBorder": false }
        }
      ]
    };
  });

  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  server.registerTool(
    "show_declarative_ui",
    {
      title: "Show Declarative UI Component",
      description:
        "Renders a declarative UI component from a pre-made JSON definition. Use this ONLY when you already have a complete, valid JSON object that conforms to the declarative UI schema. For creating new dashboards from natural language, use generate_declarative_ui instead.",
      inputSchema: z.object({
        componentData: z.object({
          layout: z.object({
            engine: z.string().optional(),
            cols: z.number().optional(),
            rowHeight: z.number().optional(),
            margin: z.array(z.number()).optional(),
            containerPadding: z.array(z.number()).optional(),
            items: z.array(z.object({
              i: z.string(),
              x: z.number(),
              y: z.number(),
              w: z.number(),
              h: z.number()
            }))
          }),
          components: z.record(z.any()),
          data: z.record(z.any()).optional()
        }).describe("JSON object defining the declarative UI component with layout and components")
      }),
      _meta: {
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "Rendering Declarative UI",
        "openai/toolInvocation/invoked": "Declarative UI ready"
      }
    },
    async (args) => {
      currentComponentData = args.componentData;

      return {
        content: [{ type: "text", text: "Declarative UI component rendered successfully" }],
        structuredContent: { componentData: args.componentData }
      };
    }
  );

  server.registerTool(
    "generate_declarative_ui",
    {
      title: "Generate Declarative UI from Natural Language",
      description:
        "PREFERRED TOOL for creating dashboards. Uses an AI agent with specialized knowledge of dashboard schemas to generate complex, validated UI from natural language. Handles charts (bar, line, pie, scatter), maps, tables, markdown, and mermaid diagrams. Automatically validates against schema and generates proper data structures. Use this instead of manually creating JSON when the user asks to create/build/make a dashboard or visualization.",
      inputSchema: z.object({
        prompt: z.string().describe("Natural language description of the desired dashboard or UI components"),
        keepExisting: z.boolean().optional().describe("If true, keeps existing components and adds to them. If false, replaces the entire dashboard. Default: false")
      }),
      _meta: {
        "openai/outputTemplate": WIDGET_URI,
        "openai/toolInvocation/invoking": "Generating Declarative UI...",
        "openai/toolInvocation/invoked": "Declarative UI generated"
      }
    },
    async (args) => {
      if (!openai) {
        return {
          content: [{ type: "text", text: "Error: OPENAI_API_KEY environment variable not set. Cannot generate UI." }],
          isError: true
        };
      }

      const apiKey = process.env.OPENAI_API_KEY!;
      const currentPage = args.keepExisting ? currentComponentData : null;

      const result = await generateDeclarativeUiJson({
        userPrompt: args.prompt,
        currentPage,
        apiKey
      });

      if (!result.ok) {
        const errorMsg = `Failed to generate UI: ${result.error}${result.raw ? `\n\nRaw response:\n${result.raw}` : ""}`;
        return {
          content: [{ type: "text", text: errorMsg }],
          isError: true
        };
      }

      currentComponentData = result.uiJson;
      console.log("[generate_declarative_ui] Data set, components:", Object.keys(result.uiJson.components));

      return {
        content: [{ type: "text", text: "Declarative UI generated and rendered successfully" }],
        structuredContent: {
          componentData: result.uiJson
        },
        _meta: {
          "openai/outputTemplate": WIDGET_URI
        }
      };
    }
  );

  return server;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id"
    });
    res.end();
    return;
  }

  if (!req.method || !MCP_METHODS.has(req.method)) {
    res.status(405).send("Method Not Allowed");
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  const server = createDeclarativeUIServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).send("Internal server error");
    }
  }
}
