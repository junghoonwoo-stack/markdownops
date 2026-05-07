import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import {
  asTextContent,
  type NotionPage,
  type NotionUser,
} from "../types.js";
import { pageIdArg } from "./refs.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set reviewers on the Assignees people property. Resolves Notion user IDs, names, or emails.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notion page UUID." },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Notion user IDs, display names, or emails.",
      },
    },
    required: ["id", "assignees"],
  },
};

async function resolvePeopleIds(c: NotionClient, names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const data = await notionRequest<{ results: NotionUser[] }>(c, `/users`, {
    query: { page_size: 100 },
  });
  const ids: string[] = [];
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

export async function assign(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const id = pageIdArg(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const ids = await resolvePeopleIds(c, assignees);

  const updated = await notionRequest<NotionPage>(c, `/pages/${id}`, {
    method: "PATCH",
    body: {
      properties: {
        Assignees: { people: ids.map((uid) => ({ id: uid })) },
      },
    },
  });

  const resolved = (updated.properties.Assignees?.people ?? []).map(
    (p) => p.name ?? p.id
  );

  return asTextContent({
    id,
    assignees: resolved,
    url: updated.url,
  });
}
