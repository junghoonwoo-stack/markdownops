import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import { asTextContent, type GitlabNote } from "../types.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a comment on a coordination unit. Use this to attach reviewer agent output (the structured Review block) or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitLab issue iid." },
      body: { type: "string", description: "Comment body in Markdown." },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const id = Number(args.id);
  const body = String(args.body ?? "");
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue iid");
  }
  if (!body) throw new Error("body is required");

  const note = await gitlabRequest<GitlabNote>(
    c,
    `/projects/${c.encodedProject}/issues/${id}/notes`,
    {
      method: "POST",
      body: { body },
    }
  );

  return asTextContent({
    commentId: note.id,
    issueId: id,
    createdAt: note.created_at,
  });
}
