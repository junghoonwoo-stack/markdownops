import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  asanaRequest,
  resolveTagGids,
  resolveUserGid,
  type AsanaClient,
} from "../asana-client.js";
import { asTextContent, type AsanaTask } from "../types.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (Asana task) in the configured project. Notes hold the Markdown body.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Tag names. Auto-created in the workspace if missing.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Asana usernames or emails. The first becomes assignee.",
      },
    },
    required: ["title", "body"],
  },
};

export async function createIssue(
  args: Record<string, unknown>,
  c: AsanaClient
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
  const tagGids = await resolveTagGids(c, labels);
  const assigneeGid =
    assigneeNames.length > 0 ? await resolveUserGid(c, assigneeNames[0]) : null;

  const data: Record<string, unknown> = {
    name: title,
    notes: body,
    projects: [c.projectGid],
  };
  if (tagGids.length > 0) data.tags = tagGids;
  if (assigneeGid) data.assignee = assigneeGid;

  const res = await asanaRequest<{ data: AsanaTask }>(c, `/tasks`, {
    method: "POST",
    body: { data },
    query: {
      opt_fields: "name,permalink_url,completed,tags.name,assignee.name",
    },
  });
  const task = res.data;

  return asTextContent({
    id: task.gid,
    url: task.permalink_url ?? "",
    title: task.name,
    state: task.completed ? "completed" : "active",
    labels: (task.tags ?? []).map((t) => t.name),
    assignees: task.assignee ? [task.assignee.name] : [],
  });
}
