import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import { asTextContent, type GitlabIssue, type GitlabUser } from "../types.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set reviewers / owners on a coordination unit. Resolves GitLab usernames to user IDs and assigns them.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitLab issue iid." },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "GitLab usernames to assign.",
      },
    },
    required: ["id", "assignees"],
  },
};

export async function assign(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const id = Number(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue iid");
  }
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const ids: number[] = [];
  for (const username of assignees) {
    const users = await gitlabRequest<GitlabUser[]>(c, `/users`, {
      query: { username },
    });
    if (users.length === 0) {
      throw new Error(`No GitLab user found for username: ${username}`);
    }
    ids.push(users[0].id);
  }

  const updated = await gitlabRequest<GitlabIssue>(
    c,
    `/projects/${c.encodedProject}/issues/${id}`,
    {
      method: "PUT",
      body: { assignee_ids: ids },
    }
  );

  return asTextContent({
    id,
    assignees: (updated.assignees ?? []).map((a) => a.username),
    url: updated.web_url,
  });
}
