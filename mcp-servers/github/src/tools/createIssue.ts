import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import { asTextContent } from "../types.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (GitHub Issue) for a MarkdownOps artifact. The body should be the Markdown artifact content or a link to it.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Issue title — usually the artifact's heading." },
      body: { type: "string", description: "Issue body — Markdown artifact content or link." },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Optional labels in addition to MDOPS_DEFAULT_LABELS.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "GitHub usernames to assign as reviewers.",
      },
    },
    required: ["title", "body"],
  },
};

export async function createIssue(
  args: Record<string, unknown>,
  c: GithubClient
) {
  const title = String(args.title ?? "");
  const body = String(args.body ?? "");
  const extraLabels = Array.isArray(args.labels) ? (args.labels as string[]) : [];
  const assignees = Array.isArray(args.assignees) ? (args.assignees as string[]) : [];

  if (!title) throw new Error("title is required");
  if (!body) throw new Error("body is required");

  const labels = Array.from(new Set([...c.defaultLabels, ...extraLabels]));

  const res = await c.octokit.issues.create({
    owner: c.owner,
    repo: c.repo,
    title,
    body,
    labels,
    assignees,
  });

  return asTextContent({
    id: res.data.number,
    url: res.data.html_url,
    title: res.data.title,
    state: res.data.state,
    labels: (res.data.labels ?? []).map((l) =>
      typeof l === "string" ? l : l.name ?? ""
    ),
    assignees: (res.data.assignees ?? []).map((a) => a?.login ?? ""),
  });
}
