import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  asanaRequest,
  type AsanaClient,
} from "../asana-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  statusLabel,
  type AsanaTask,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "List coordination units in the configured Asana project. Status, assignee, and free-text query are post-filtered client-side.",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
      },
      assignee: { type: "string" },
      query: { type: "string" },
      limit: { type: "number" },
    },
  },
};

export async function listIssues(
  args: Record<string, unknown>,
  c: AsanaClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const res = await asanaRequest<{ data: AsanaTask[] }>(
    c,
    `/projects/${c.projectGid}/tasks`,
    {
      query: {
        opt_fields:
          "name,notes,permalink_url,completed,tags.name,assignee.name,modified_at",
        limit,
      },
    }
  );

  let tasks = res.data;
  if (status) {
    const target = statusLabel(status as Status);
    tasks = tasks.filter((t) =>
      (t.tags ?? []).some((tag) => tag.name === target)
    );
  }
  if (assignee) {
    const lower = assignee.toLowerCase();
    tasks = tasks.filter(
      (t) => t.assignee && t.assignee.name.toLowerCase() === lower
    );
  }
  if (query) {
    const q = query.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q)
    );
  }

  return asTextContent(
    tasks.map((t) => {
      const tags = (t.tags ?? []).map((x) => x.name);
      const statusFromLabel = tags.find((x) =>
        x.startsWith(STATUS_LABEL_PREFIX)
      );
      return {
        id: t.gid,
        url: t.permalink_url ?? "",
        title: t.name,
        state: t.completed ? "completed" : "active",
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels: tags,
        assignees: t.assignee ? [t.assignee.name] : [],
        updatedAt: t.modified_at ?? null,
      };
    })
  );
}
