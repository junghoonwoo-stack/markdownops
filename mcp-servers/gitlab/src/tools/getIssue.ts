import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  type GitlabIssue,
} from "../types.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (GitLab Issue) by its iid.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "GitLab issue iid (the per-project number shown as #N).",
      },
    },
    required: ["id"],
  },
};

export async function getIssue(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue iid");
  }

  const issue = await gitlabRequest<GitlabIssue>(
    c,
    `/projects/${c.encodedProject}/issues/${id}`
  );

  const statusLabel = (issue.labels ?? []).find((l) =>
    l.startsWith(STATUS_LABEL_PREFIX)
  );

  return asTextContent({
    id: issue.iid,
    url: issue.web_url,
    title: issue.title,
    body: issue.description ?? "",
    state: issue.state,
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels: issue.labels,
    assignees: (issue.assignees ?? []).map((a) => a.username),
    comments: issue.user_notes_count ?? 0,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
  });
}
