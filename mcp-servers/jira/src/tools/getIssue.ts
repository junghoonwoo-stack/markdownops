import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  type JiraIssue,
} from "../types.js";
import { issueRefArg } from "./refs.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (Jira Issue) by id or key.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        oneOf: [{ type: "number" }, { type: "string" }],
        description: "Jira issue ID (number) or key string (e.g. PROJ-123).",
      },
    },
    required: ["id"],
  },
};

export async function getIssue(args: Record<string, unknown>, c: JiraClient) {
  const ref = issueRefArg(args.id);
  const issue = await jiraRequest<JiraIssue>(c, `/issue/${encodeURIComponent(ref)}`);
  const labels = issue.fields.labels ?? [];
  const statusLabel = labels.find((l) => l.startsWith(STATUS_LABEL_PREFIX));

  return asTextContent({
    id: issue.key,
    url: `${c.host}/browse/${issue.key}`,
    title: issue.fields.summary,
    body: issue.fields.description ?? "",
    state: issue.fields.status?.name ?? "unknown",
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels,
    assignees: issue.fields.assignee
      ? [issue.fields.assignee.displayName]
      : [],
    comments: issue.fields.comment?.total ?? 0,
    createdAt: issue.fields.created ?? null,
    updatedAt: issue.fields.updated ?? null,
  });
}
