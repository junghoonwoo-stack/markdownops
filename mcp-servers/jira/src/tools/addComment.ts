import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import { asTextContent, type JiraComment } from "../types.js";
import { issueRefArg } from "./refs.js";

export const addCommentTool: Tool = {
  name: "mdops_add_comment",
  description:
    "Post a comment on a coordination unit. Use this to attach reviewer agent output (the structured Review block) or human decisions.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        oneOf: [{ type: "number" }, { type: "string" }],
        description: "Jira issue ID or key (e.g. PROJ-123).",
      },
      body: { type: "string", description: "Comment body." },
    },
    required: ["id", "body"],
  },
};

export async function addComment(
  args: Record<string, unknown>,
  c: JiraClient
) {
  const ref = issueRefArg(args.id);
  const body = String(args.body ?? "");
  if (!body) throw new Error("body is required");

  const note = await jiraRequest<JiraComment>(
    c,
    `/issue/${encodeURIComponent(ref)}/comment`,
    {
      method: "POST",
      body: { body },
    }
  );

  return asTextContent({
    commentId: note.id,
    issueId: ref,
    createdAt: note.created,
  });
}
