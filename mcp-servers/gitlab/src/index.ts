#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createGitlabClient } from "./gitlab-client.js";
import { tools, dispatch } from "./tools/index.js";

const TOKEN = process.env.GITLAB_TOKEN;
const PROJECT = process.env.MDOPS_GITLAB_PROJECT;
const HOST = process.env.MDOPS_GITLAB_HOST ?? "https://gitlab.com";

if (!TOKEN || !PROJECT) {
  console.error(
    "GITLAB_TOKEN and MDOPS_GITLAB_PROJECT environment variables are required.\n" +
      "Example:\n  export GITLAB_TOKEN=glpat-...\n  export MDOPS_GITLAB_PROJECT=namespace/repo"
  );
  process.exit(1);
}

const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const client = createGitlabClient({
  token: TOKEN,
  project: PROJECT,
  host: HOST,
  defaultLabels,
});

const server = new Server(
  { name: "markdownops-gitlab", version: "0.1.0" },
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
