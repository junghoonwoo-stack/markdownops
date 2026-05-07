import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import {
  asTextContent,
  STATUS_LABEL_PREFIX,
  statusLabel,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "Search and filter coordination units. Supports filtering by MarkdownOps status, assignee, and free-text query (matches title and body).",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
        description: "Filter by MarkdownOps status (mapped to mdops:status:* label).",
      },
      assignee: {
        type: "string",
        description: "GitHub username — only issues assigned to this user.",
      },
      query: {
        type: "string",
        description: "Free-text query — matches title and body case-insensitively (post-filtered).",
      },
      limit: {
        type: "number",
        description: "Maximum number of issues to return. Default 30, max 100.",
      },
    },
  },
};

export async function listIssues(
  args: Record<string, unknown>,
  c: GithubClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const labels: string[] = [];
  if (status) labels.push(statusLabel(status as Status));

  const res = await c.octokit.issues.listForRepo({
    owner: c.owner,
    repo: c.repo,
    state: "all",
    per_page: limit,
    labels: labels.length ? labels.join(",") : undefined,
    assignee: assignee || undefined,
  });

  let items = res.data.filter((i) => !i.pull_request);
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (i) =>
        (i.title ?? "").toLowerCase().includes(q) ||
        (i.body ?? "").toLowerCase().includes(q)
    );
  }

  return asTextContent(
    items.map((i) => {
      const itemLabels = (i.labels ?? []).map((l) =>
        typeof l === "string" ? l : l.name ?? ""
      );
      const statusFromLabel = itemLabels.find((l) =>
        l.startsWith(STATUS_LABEL_PREFIX)
      );
      return {
        id: i.number,
        url: i.html_url,
        title: i.title,
        state: i.state,
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels: itemLabels,
        assignees: (i.assignees ?? []).map((a) => a?.login ?? ""),
        updatedAt: i.updated_at,
      };
    })
  );
}
