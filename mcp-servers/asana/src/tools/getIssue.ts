import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { asanaRequest, type AsanaClient } from "../asana-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  type AsanaTask,
} from "../types.js";
import { taskGidArg } from "./refs.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (Asana task) by its GID.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Asana task GID." },
    },
    required: ["id"],
  },
};

export async function getIssue(args: Record<string, unknown>, c: AsanaClient) {
  const id = taskGidArg(args.id);
  const res = await asanaRequest<{ data: AsanaTask }>(c, `/tasks/${id}`, {
    query: {
      opt_fields:
        "name,notes,permalink_url,completed,tags.name,assignee.name,followers.name,created_at,modified_at",
    },
  });
  const task = res.data;
  const tags = (task.tags ?? []).map((t) => t.name);
  const statusLabel = tags.find((t) => t.startsWith(STATUS_LABEL_PREFIX));

  return asTextContent({
    id: task.gid,
    url: task.permalink_url ?? "",
    title: task.name,
    body: task.notes ?? "",
    state: task.completed ? "completed" : "active",
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels: tags,
    assignees: task.assignee ? [task.assignee.name] : [],
    createdAt: task.created_at ?? null,
    updatedAt: task.modified_at ?? null,
  });
}
