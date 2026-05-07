import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import { asTextContent, type GitlabIssue, type GitlabUser } from "../types.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (GitLab Issue) for a MarkdownOps artifact. The body should be the Markdown artifact content or a link to it.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue title — usually the artifact's heading." },
      body: { type: "string", description: "Issue description — Markdown artifact content or link." },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Optional labels in addition to MDOPS_DEFAULT_LABELS.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "GitLab usernames to assign as reviewers (resolved to user IDs internally).",
      },
    },
    required: ["title", "body"],
  },
};

export async function createIssue(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const title = String(args.title ?? "");
  const body = String(args.body ?? "");
  const extraLabels = Array.isArray(args.labels) ? (args.labels as string[]) : [];
  const assigneeUsernames = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];

  if (!title) throw new Error("title is required");
  if (!body) throw new Error("body is required");

  const labels = Array.from(new Set([...c.defaultLabels, ...extraLabels]));

  const assigneeIds: number[] = [];
  for (const username of assigneeUsernames) {
    const users = await gitlabRequest<GitlabUser[]>(c, `/users`, {
      query: { username },
    });
    if (users.length > 0) assigneeIds.push(users[0].id);
  }

  const issue = await gitlabRequest<GitlabIssue>(
    c,
    `/projects/${c.encodedProject}/issues`,
    {
      method: "POST",
      body: {
        title,
        description: body,
        labels: labels.join(","),
        assignee_ids: assigneeIds,
      },
    }
  );

  return asTextContent({
    id: issue.iid,
    url: issue.web_url,
    title: issue.title,
    state: issue.state,
    labels: issue.labels,
    assignees: (issue.assignees ?? []).map((a) => a.username),
  });
}
