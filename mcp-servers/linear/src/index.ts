#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createLinearClient } from "./linear-client.js";
import { tools, dispatch } from "./tools/index.js";

const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.MDOPS_LINEAR_TEAM;

if (!KEY || !TEAM) {
  console.error(
    "LINEAR_API_KEY and MDOPS_LINEAR_TEAM are required.\n" +
      "Example:\n  export LINEAR_API_KEY=lin_api_...\n  export MDOPS_LINEAR_TEAM=ENG"
  );
  process.exit(1);
}

const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const artifactBase = process.env.MDOPS_LINEAR_ARTIFACT_BASE ?? "";

const client = createLinearClient({
  apiKey: KEY,
  teamRef: TEAM,
  defaultLabels,
  artifactBase,
});

const server = new Server(
  { name: "markdownops-linear", version: "0.1.0" },
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
