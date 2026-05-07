import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import { asTextContent, type NotionComment } from "../types.js";
import { pageIdArg } from "./refs.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a comment on a coordination unit. Use for reviewer agent output (the structured Review block) or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notion page UUID." },
      body: { type: "string", description: "Comment body (Markdown)." },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const id = pageIdArg(args.id);
  const body = String(args.body ?? "");
  if (!body) throw new Error("body is required");

  const comment = await notionRequest<NotionComment>(c, `/comments`, {
    method: "POST",
    body: {
      parent: { page_id: id },
      rich_text: [{ type: "text", text: { content: body.slice(0, 2000) } }],
    },
  });

  return asTextContent({
    commentId: comment.id,
    issueId: id,
    createdAt: comment.created_time,
  });
}
