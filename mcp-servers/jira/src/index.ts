#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createJiraClient } from "./jira-client.js";
import { tools, dispatch } from "./tools/index.js";

const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const HOST = process.env.MDOPS_JIRA_HOST;
const PROJECT = process.env.MDOPS_JIRA_PROJECT;

if (!EMAIL || !TOKEN || !HOST || !PROJECT) {
  console.error(
    "JIRA_EMAIL, JIRA_API_TOKEN, MDOPS_JIRA_HOST, and MDOPS_JIRA_PROJECT are required."
  );
  process.exit(1);
}

const issueType = process.env.MDOPS_JIRA_ISSUE_TYPE ?? "Task";
const defaultLabels = (process.env.MDOPS_DEFAULT_LABELS ?? "markdownops")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const artifactBase = process.env.MDOPS_JIRA_ARTIFACT_BASE ?? "";

const client = createJiraClient({
  email: EMAIL,
  token: TOKEN,
  host: HOST,
  project: PROJECT,
  issueType,
  defaultLabels,
  artifactBase,
});

const server = new Server(
  { name: "markdownops-jira", version: "0.1.0" },
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
