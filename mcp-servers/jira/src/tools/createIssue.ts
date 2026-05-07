import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import { asTextContent, type JiraIssue, type JiraUser } from "../types.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (Jira Issue) for a MarkdownOps artifact. The body becomes the issue description.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue summary." },
      body: { type: "string", description: "Issue description (Markdown source)." },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Optional labels in addition to MDOPS_DEFAULT_LABELS.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Email or display name. The first is assigned; the rest become watchers (handled by mdops_assign — only the first is set at create-time).",
      },
    },
    required: ["title", "body"],
  },
};

async function lookupAccountId(c: JiraClient, query: string): Promise<string | null> {
  const users = await jiraRequest<JiraUser[]>(c, `/user/search`, {
    query: { query },
  });
  return users[0]?.accountId ?? null;
}

export async function createIssue(
  args: Record<string, unknown>,
  c: JiraClient
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

  let assigneeAccountId: string | null = null;
  if (assigneeNames.length > 0) {
    assigneeAccountId = await lookupAccountId(c, assigneeNames[0]);
  }

  const fields: Record<string, unknown> = {
    project: { key: c.project },
    summary: title,
    description: body,
    issuetype: { name: c.issueType },
    labels,
  };
  if (assigneeAccountId) fields.assignee = { accountId: assigneeAccountId };

  const created = await jiraRequest<{ id: string; key: string; self: string }>(
    c,
    `/issue`,
    {
      method: "POST",
      body: { fields },
    }
  );

  // Re-fetch for full state (Jira create response is minimal).
  const issue = await jiraRequest<JiraIssue>(c, `/issue/${created.key}`);

  return asTextContent({
    id: issue.key,
    url: `${c.host}/browse/${issue.key}`,
    title: issue.fields.summary,
    state: issue.fields.status?.name ?? "unknown",
    labels: issue.fields.labels ?? [],
    assignees: issue.fields.assignee ? [issue.fields.assignee.displayName] : [],
  });
}
