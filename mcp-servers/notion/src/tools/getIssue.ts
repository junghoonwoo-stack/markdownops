import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  type NotionBlockChildrenResponse,
  type NotionPage,
} from "../types.js";
import { blocksToMarkdown } from "../markdown.js";
import { pageIdArg } from "./refs.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (Notion page) by ID.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notion page UUID." },
    },
    required: ["id"],
  },
};

function titleOf(page: NotionPage): string {
  for (const [, prop] of Object.entries(page.properties)) {
    if (prop.type === "title" && Array.isArray(prop.title)) {
      return prop.title.map((t) => t.plain_text ?? t.text?.content ?? "").join("");
    }
  }
  return "";
}

export async function getIssue(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const id = pageIdArg(args.id);

  const page = await notionRequest<NotionPage>(c, `/pages/${id}`);
  const blockResp = await notionRequest<NotionBlockChildrenResponse>(
    c,
    `/blocks/${id}/children`,
    { query: { page_size: 100 } }
  );

  const labels = (page.properties.Tags?.multi_select ?? []).map((t) => t.name);
  const statusLabel = labels.find((l) => l.startsWith(STATUS_LABEL_PREFIX));
  const assignees = (page.properties.Assignees?.people ?? []).map(
    (p) => p.name ?? p.id
  );

  return asTextContent({
    id: page.id,
    url: page.url,
    title: titleOf(page),
    body: blocksToMarkdown(blockResp.results),
    state: "active",
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels,
    assignees,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  });
}
