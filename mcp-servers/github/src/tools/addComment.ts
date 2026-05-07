import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import { asTextContent } from "../types.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a comment on a coordination unit. Use this to attach reviewer agent output (the structured Review block) or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitHub issue number." },
      body: { type: "string", description: "Comment body in Markdown." },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: GithubClient
) {
  const id = Number(args.id);
  const body = String(args.body ?? "");
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue number");
  }
  if (!body) throw new Error("body is required");

  const res = await c.octokit.issues.createComment({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
    body,
  });

  return asTextContent({
    commentId: res.data.id,
    url: res.data.html_url,
    issueId: id,
    createdAt: res.data.created_at,
  });
}
