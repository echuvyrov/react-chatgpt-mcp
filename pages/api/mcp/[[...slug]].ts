import type { NextApiRequest, NextApiResponse } from "next";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export const config = {
  api: {
    bodyParser: false
  }
};

const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
const WIDGET_URI = "ui://widget/declarative-ui.html";
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

  server.registerResource("declarative-ui-widget", WIDGET_URI, {}, async () => {
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
        "Renders a declarative UI component from a JSON definition. Accepts a JSON object defining the component structure.",
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
