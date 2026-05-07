#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createNotionClient } from "./notion-client.js";
import { tools, dispatch } from "./tools/index.js";

const KEY = process.env.NOTION_API_KEY;
const DB = process.env.MDOPS_NOTION_DATABASE;

if (!KEY || !DB) {
  console.error(
    "NOTION_API_KEY and MDOPS_NOTION_DATABASE are required.\n" +
      "Example:\n  export NOTION_API_KEY=secret_...\n  export MDOPS_NOTION_DATABASE=<database-uuid>"
  );
  process.exit(1);
}

const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const artifactBase = process.env.MDOPS_NOTION_ARTIFACT_BASE ?? "";

const client = createNotionClient({
  apiKey: KEY,
  databaseId: DB,
  defaultLabels,
  artifactBase,
});

const server = new Server(
  { name: "markdownops-notion", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  try {
    return await dispatch(req.params.name, args, client);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
