import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import { asTextContent, STATUS_LABEL_PREFIX } from "../types.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (GitHub Issue) by its number.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "GitHub issue number (e.g. 42 for #42).",
      },
    },
    required: ["id"],
  },
};

export async function getIssue(
  args: Record<string, unknown>,
  c: GithubClient
) {
  const id = Number(args.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue number");
  }

  const res = await c.octokit.issues.get({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
  });

  const labels = (res.data.labels ?? []).map((l) =>
    typeof l === "string" ? l : l.name ?? ""
  );
  const statusLabel = labels.find((l) => l.startsWith(STATUS_LABEL_PREFIX));

  return asTextContent({
    id: res.data.number,
    url: res.data.html_url,
    title: res.data.title,
    body: res.data.body ?? "",
    state: res.data.state,
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels,
    assignees: (res.data.assignees ?? []).map((a) => a?.login ?? ""),
    comments: res.data.comments,
    createdAt: res.data.created_at,
    updatedAt: res.data.updated_at,
  });
}
