import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  gql,
  resolveIssueId,
  type LinearClient,
} from "../linear-client.js";
import { asTextContent, type LinearComment } from "../types.js";
import { issueRefArg } from "./index.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a coordination unit by posting a comment that links to the file. Uses MDOPS_LINEAR_ARTIFACT_BASE if set; otherwise the relative path is included verbatim.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      artifact_path: {
        type: "string",
        description: "Repo-relative path to the Markdown artifact.",
      },
      commit: {
        type: "string",
        description: "Optional commit SHA or ref appended after the base.",
      },
    },
    required: ["id", "artifact_path"],
  },
};

export async function linkArtifact(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const ref = issueRefArg(args.id);
  const artifactPath = String(args.artifact_path ?? "");
  const commit = String(args.commit ?? "");
  if (!artifactPath) throw new Error("artifact_path is required");

  const url = c.artifactBase
    ? `${c.artifactBase}${commit ? "/" + encodeURIComponent(commit) : ""}/${artifactPath
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/")}`
    : null;

  const body = url
    ? `**Linked artifact:** [\`${artifactPath}\`](${url})${commit ? ` (at \`${commit}\`)` : ""}`
    : `**Linked artifact:** \`${artifactPath}\`${commit ? ` (at \`${commit}\`)` : ""}`;

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
    artifactUrl: url,
    issueId: ref,
  });
}
