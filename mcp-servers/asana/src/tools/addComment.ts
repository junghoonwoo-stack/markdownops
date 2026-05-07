import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { asanaRequest, type AsanaClient } from "../asana-client.js";
import { asTextContent, type AsanaStory } from "../types.js";
import { taskGidArg } from "./refs.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a story (comment) on a task. Use for reviewer agent output or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Asana task GID." },
      body: { type: "string" },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: AsanaClient
) {
  const id = taskGidArg(args.id);
  const body = String(args.body ?? "");
  if (!body) throw new Error("body is required");

  const res = await asanaRequest<{ data: AsanaStory }>(
    c,
    `/tasks/${id}/stories`,
    { method: "POST", body: { data: { text: body } } }
  );

  return asTextContent({
    commentId: res.data.gid,
    issueId: id,
    createdAt: res.data.created_at ?? null,
  });
}
