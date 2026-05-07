import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import { asTextContent } from "../types.js";

export const linkArtifactTool: Tool = {
  name: "mdops_link_artifact",
  description:
    "Attach a Markdown source artifact to a coordination unit by posting a comment that links to the file in the GitHub repo.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitHub issue number." },
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
  c: GithubClient
) {
  const id = Number(args.id);
  const artifactPath = String(args.artifact_path ?? "");
  const commit = String(args.commit ?? "main");
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue number");
  }
  if (!artifactPath) throw new Error("artifact_path is required");

  const url = `https://github.com/${c.owner}/${c.repo}/blob/${encodeURIComponent(
    commit
  )}/${artifactPath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/")}`;

  const body = `**Linked artifact:** [\`${artifactPath}\`](${url}) (at \`${commit}\`)`;

  const res = await c.octokit.issues.createComment({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
    body,
  });

  return asTextContent({
    commentId: res.data.id,
    commentUrl: res.data.html_url,
    artifactUrl: url,
    issueId: id,
  });
}
