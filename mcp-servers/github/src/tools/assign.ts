import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import { asTextContent } from "../types.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set reviewers / owners on a coordination unit. Adds the given GitHub usernames as assignees.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitHub issue number." },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "GitHub usernames to assign.",
      },
    },
    required: ["id", "assignees"],
  },
};

export async function assign(args: Record<string, unknown>, c: GithubClient) {
  const id = Number(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue number");
  }
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const res = await c.octokit.issues.addAssignees({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
    assignees,
  });

  return asTextContent({
    id,
    assignees: (res.data.assignees ?? []).map((a) => a?.login ?? ""),
    url: res.data.html_url,
  });
}
