import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import { asTextContent, type NotionPage, type NotionUser } from "../types.js";
import { markdownToBlocks } from "../markdown.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (Notion page) in the configured database. The body is rendered into Notion blocks.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Optional Tags multi-select values in addition to MDOPS_DEFAULT_LABELS.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Notion user IDs or person emails to set on the Assignees property.",
      },
    },
    required: ["title", "body"],
  },
};

async function resolvePeopleIds(c: NotionClient, names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const ids: string[] = [];
  const data = await notionRequest<{ results: NotionUser[] }>(c, `/users`, {
    query: { page_size: 100 },
  });
  for (const name of names) {
    const lower = name.toLowerCase();
    const match = data.results.find(
      (u) => u.id === name || u.person?.email?.toLowerCase() === lower || u.name?.toLowerCase() === lower
    );
    if (!match) throw new Error(`No Notion user found for: ${name}`);
    ids.push(match.id);
  }
  return ids;
}

export async function createIssue(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const title = String(args.title ?? "");
  const body = String(args.body ?? "");
  const extraLabels = Array.isArray(args.labels) ? (args.labels as string[]) : [];
  const assigneeNames = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];

  if (!title) throw new Error("title is required");
  if (!body) throw new Error("body is required");

  const labels = Array.from(new Set([...c.defaultLabels, ...extraLabels]));
  const peopleIds = await resolvePeopleIds(c, assigneeNames);
  const blocks = markdownToBlocks(body).slice(0, 100);

  const properties: Record<string, unknown> = {
    Name: { title: [{ type: "text", text: { content: title } }] },
    Tags: { multi_select: labels.map((name) => ({ name })) },
  };
  if (peopleIds.length > 0) {
    properties.Assignees = { people: peopleIds.map((id) => ({ id })) };
  }

  const page = await notionRequest<NotionPage>(c, `/pages`, {
    method: "POST",
    body: {
      parent: { database_id: c.databaseId },
      properties,
      children: blocks,
    },
  });

  const tagsProp = page.properties.Tags;
  const assigneesProp = page.properties.Assignees;
  return asTextContent({
    id: page.id,
    url: page.url,
    title,
    state: "active",
    labels: (tagsProp?.multi_select ?? []).map((t) => t.name),
    assignees: (assigneesProp?.people ?? []).map((p) => p.name ?? p.id),
  });
}
