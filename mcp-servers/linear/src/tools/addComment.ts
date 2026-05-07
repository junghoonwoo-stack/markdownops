import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  gql,
  resolveIssueId,
  type LinearClient,
} from "../linear-client.js";
import { asTextContent, type LinearComment } from "../types.js";
import { issueRefArg } from "./index.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a comment on a coordination unit. Use for reviewer agent output (the structured Review block) or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Linear identifier or UUID." },
      body: { type: "string", description: "Comment body (Markdown)." },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const ref = issueRefArg(args.id);
  const body = String(args.body ?? "");
  if (!body) throw new Error("body is required");

  const issueId = await resolveIssueId(c, ref);

  const data = await gql<{
    commentCreate: { success: boolean; comment: LinearComment };
  }>(
    c,
    `mutation CommentCreate($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment { id createdAt }
      }
    }`,
    { input: { issueId, body } }
  );

  if (!data.commentCreate.success) {
    throw new Error("Linear commentCreate returned success=false");
  }

  return asTextContent({
    commentId: data.commentCreate.comment.id,
    issueId: ref,
    createdAt: data.commentCreate.comment.createdAt,
  });
}
