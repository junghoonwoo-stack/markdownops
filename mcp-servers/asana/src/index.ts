#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createAsanaClient } from "./asana-client.js";
import { tools, dispatch } from "./tools/index.js";

const PAT = process.env.ASANA_PAT;
const PROJECT = process.env.MDOPS_ASANA_PROJECT;

if (!PAT || !PROJECT) {
  console.error(
    "ASANA_PAT and MDOPS_ASANA_PROJECT are required.\n" +
      "Example:\n  export ASANA_PAT=...\n  export MDOPS_ASANA_PROJECT=1234567890"
  );
  process.exit(1);
}

const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const client = createAsanaClient({
  pat: PAT,
  projectGid: PROJECT,
  workspaceGid: process.env.MDOPS_ASANA_WORKSPACE,
  defaultLabels,
  artifactBase: process.env.MDOPS_ASANA_ARTIFACT_BASE ?? "",
});

const server = new Server(
  { name: "markdownops-asana", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  try {
    return await dispatch(req.params.name, args, client);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
