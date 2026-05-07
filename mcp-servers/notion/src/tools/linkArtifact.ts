import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import { asTextContent, type NotionComment } from "../types.js";
import { pageIdArg } from "./refs.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a coordination unit by posting a comment that links to the file. Uses MDOPS_NOTION_ARTIFACT_BASE if set; otherwise the relative path is included verbatim.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notion page UUID." },
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
  c: NotionClient
) {
  const id = pageIdArg(args.id);
  const artifactPath = String(args.artifact_path ?? "");
  const commit = String(args.commit ?? "");
  if (!artifactPath) throw new Error("artifact_path is required");

  const url = c.artifactBase
    ? `${c.artifactBase}${commit ? "/" + encodeURIComponent(commit) : ""}/${artifactPath
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/")}`
    : null;

  const text = url
    ? `Linked artifact: ${artifactPath} -> ${url}${commit ? ` (at ${commit})` : ""}`
    : `Linked artifact: ${artifactPath}${commit ? ` (at ${commit})` : ""}`;

  const comment = await notionRequest<NotionComment>(c, `/comments`, {
    method: "POST",
    body: {
      parent: { page_id: id },
      rich_text: url
        ? [
            { type: "text", text: { content: "Linked artifact: " } },
            {
              type: "text",
              text: { content: artifactPath, link: { url } },
            },
            ...(commit
              ? [{ type: "text", text: { content: ` (at ${commit})` } }]
              : []),
          ]
        : [{ type: "text", text: { content: text } }],
    },
  });

  return asTextContent({
    commentId: comment.id,
    artifactUrl: url,
    issueId: id,
  });
}
