import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type NotionPage,
  type Status,
} from "../types.js";
import { pageIdArg } from "./refs.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a coordination unit's MarkdownOps status by replacing the mdops:status:* tag in the Tags multi-select.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notion page UUID." },
      status: { type: "string", enum: [...STATUS_VALUES] },
    },
    required: ["id", "status"],
  },
};

export async function updateStatus(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const id = pageIdArg(args.id);
  const next = args.status as Status;
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(
      `status must be one of: ${STATUS_VALUES.join(", ")}, got: ${String(next)}`
    );
  }

  const current = await notionRequest<NotionPage>(c, `/pages/${id}`);
  const currentTags = (current.properties.Tags?.multi_select ?? []).map(
    (t) => t.name
  );
  const kept = currentTags.filter((name) => !isStatusLabel(name));
  const newLabel = statusLabel(next);
  const nextTags = [...kept, newLabel];

  await notionRequest<NotionPage>(c, `/pages/${id}`, {
    method: "PATCH",
    body: {
      properties: {
        Tags: { multi_select: nextTags.map((name) => ({ name })) },
      },
    },
  });

  return asTextContent({
    id,
    status: next,
    label: newLabel,
    state: "active",
  });
}
