import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import { asTextContent, type GitlabNote } from "../types.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a coordination unit by posting a comment that links to the file in the GitLab project.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitLab issue iid." },
      artifact_path: {
        type: "string",
        description: "Repo-relative path to the Markdown artifact, e.g. 'artifacts/sales-requirements.md'.",
      },
      commit: {
        type: "string",
        description: "Commit SHA or branch name to link the file at. Defaults to 'main'.",
      },
    },
    required: ["id", "artifact_path"],
  },
};

export async function linkArtifact(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const id = Number(args.id);
  const artifactPath = String(args.artifact_path ?? "");
  const commit = String(args.commit ?? "main");
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue iid");
  }
  if (!artifactPath) throw new Error("artifact_path is required");

  const projectPath = /^\d+$/.test(c.project) ? null : c.project;
  // GitLab file URL: https://<host>/<namespace/repo>/-/blob/<ref>/<path>
  // For numeric project IDs we cannot construct a /blob/ URL without an extra
  // API call, so we fall back to a project-rooted notation.
  const url = projectPath
    ? `${c.host}/${projectPath}/-/blob/${encodeURIComponent(commit)}/${artifactPath
        .split("/")
        .map((s) => encodeURIComponent(s))
        .join("/")}`
    : `${c.host}/projects/${c.project} (path: ${artifactPath} @ ${commit})`;

  const body = `**Linked artifact:** [\`${artifactPath}\`](${url}) (at \`${commit}\`)`;

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
    artifactUrl: url,
    issueId: id,
  });
}
