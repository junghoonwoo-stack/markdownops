import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import { asTextContent, type JiraComment } from "../types.js";
import { issueRefArg } from "./index.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a coordination unit by posting a comment that links to the file. Uses MDOPS_JIRA_ARTIFACT_BASE if set; otherwise the relative path is included verbatim.",
  inputSchema: {
    type: "object",
    properties: {
      id: { oneOf: [{ type: "number" }, { type: "string" }] },
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
  c: JiraClient
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
    ? `*Linked artifact:* [${artifactPath}|${url}]${commit ? ` (at ${commit})` : ""}`
    : `*Linked artifact:* ${artifactPath}${commit ? ` (at ${commit})` : ""}`;

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
    artifactUrl: url,
    issueId: ref,
  });
}
