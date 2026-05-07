#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createGithubClient } from "./github-client.js";
import { tools, dispatch } from "./tools/index.js";

const REPO = process.env.MDOPS_GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

if (!REPO || !TOKEN) {
  console.error(
    "MDOPS_GITHUB_REPO and GITHUB_TOKEN environment variables are required.\n" +
      "Example:\n  export GITHUB_TOKEN=ghp_...\n  export MDOPS_GITHUB_REPO=owner/repo"
  );
  process.exit(1);
}

const slashIdx = REPO.indexOf("/");
if (slashIdx <= 0 || slashIdx === REPO.length - 1) {
  console.error(`MDOPS_GITHUB_REPO must be in "owner/repo" form, got: ${REPO}`);
  process.exit(1);
}

const owner = REPO.slice(0, slashIdx);
const repo = REPO.slice(slashIdx + 1);
const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const client = createGithubClient({ token: TOKEN, owner, repo, defaultLabels });

const server = new Server(
  { name: "markdownops-github", version: "0.1.0" },
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
