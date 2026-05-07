import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  statusLabel,
  type GitlabIssue,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "Search and filter coordination units. Supports filtering by MarkdownOps status, assignee, and free-text query (matches title and description).",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
      },
      assignee: {
        type: "string",
        description: "GitLab username — only issues assigned to this user.",
      },
      query: {
        type: "string",
        description: "Free-text query — server-side `search` against title/description.",
      },
      limit: {
        type: "number",
        description: "Maximum results. Default 30, max 100.",
      },
    },
  },
};

export async function listIssues(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const issues = await gitlabRequest<GitlabIssue[]>(
    c,
    `/projects/${c.encodedProject}/issues`,
    {
      query: {
        state: "all",
        labels: status ? statusLabel(status as Status) : undefined,
        assignee_username: assignee,
        search: query,
        per_page: limit,
        scope: "all",
      },
    }
  );

  return asTextContent(
    issues.map((i) => {
      const statusFromLabel = (i.labels ?? []).find((l) =>
        l.startsWith(STATUS_LABEL_PREFIX)
      );
      return {
        id: i.iid,
        url: i.web_url,
        title: i.title,
        state: i.state,
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels: i.labels,
        assignees: (i.assignees ?? []).map((a) => a.username),
        updatedAt: i.updated_at,
      };
    })
  );
}
