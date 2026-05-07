import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { asanaRequest, type AsanaClient } from "../asana-client.js";
import { asTextContent, type AsanaStory } from "../types.js";
import { taskGidArg } from "./refs.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a task by posting a story that links to it. Uses MDOPS_ASANA_ARTIFACT_BASE if set; otherwise the relative path is included verbatim.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      artifact_path: { type: "string" },
      commit: { type: "string" },
    },
    required: ["id", "artifact_path"],
  },
};

export async function linkArtifact(
  args: Record<string, unknown>,
  c: AsanaClient
) {
  const id = taskGidArg(args.id);
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
    ? `Linked artifact: ${artifactPath}\n${url}${commit ? ` (at ${commit})` : ""}`
    : `Linked artifact: ${artifactPath}${commit ? ` (at ${commit})` : ""}`;

  const res = await asanaRequest<{ data: AsanaStory }>(
    c,
    `/tasks/${id}/stories`,
    { method: "POST", body: { data: { text } } }
  );

  return asTextContent({
    commentId: res.data.gid,
    artifactUrl: url,
    issueId: id,
  });
}
