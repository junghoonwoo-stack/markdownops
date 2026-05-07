import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  statusLabel,
  type JiraSearchResponse,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "Search and filter coordination units. Builds JQL from the provided filters.",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
      },
      assignee: {
        type: "string",
        description: "Email or display name to filter assignee.",
      },
      query: {
        type: "string",
        description: "Free-text query — JQL `text ~ \"...\"`.",
      },
      limit: {
        type: "number",
        description: "Maximum results. Default 30, max 100.",
      },
    },
  },
};

function escapeJql(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function listIssues(
  args: Record<string, unknown>,
  c: JiraClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const clauses: string[] = [`project = "${escapeJql(c.project)}"`];
  if (status) clauses.push(`labels = "${statusLabel(status as Status)}"`);
  if (assignee) clauses.push(`assignee = "${escapeJql(assignee)}"`);
  if (query) clauses.push(`text ~ "${escapeJql(query)}"`);
  const jql = clauses.join(" AND ") + " ORDER BY updated DESC";

  const res = await jiraRequest<JiraSearchResponse>(c, `/search`, {
    query: { jql, maxResults: limit, fields: "summary,labels,assignee,status,updated" },
  });

  return asTextContent(
    res.issues.map((i) => {
      const labels = i.fields.labels ?? [];
      const statusFromLabel = labels.find((l) =>
        l.startsWith(STATUS_LABEL_PREFIX)
      );
      return {
        id: i.key,
        url: `${c.host}/browse/${i.key}`,
        title: i.fields.summary,
        state: i.fields.status?.name ?? "unknown",
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels,
        assignees: i.fields.assignee ? [i.fields.assignee.displayName] : [],
        updatedAt: i.fields.updated ?? null,
      };
    })
  );
}
