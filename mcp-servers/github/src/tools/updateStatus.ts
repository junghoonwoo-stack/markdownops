import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { GithubClient } from "../github-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type Status,
} from "../types.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a coordination unit's MarkdownOps status. Removes any prior mdops:status:* label and applies the new one. Closes the issue when the new status is 'approved'.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitHub issue number." },
      status: {
        type: "string",
        enum: [...STATUS_VALUES],
        description: "Target MarkdownOps status.",
      },
    },
    required: ["id", "status"],
  },
};

export async function updateStatus(
  args: Record<string, unknown>,
  c: GithubClient
) {
  const id = Number(args.id);
  const next = args.status as Status;
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue number");
  }
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(
      `status must be one of: ${STATUS_VALUES.join(", ")}, got: ${String(next)}`
    );
  }

  const issue = await c.octokit.issues.get({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
  });

  const currentLabels = (issue.data.labels ?? []).map((l) =>
    typeof l === "string" ? l : l.name ?? ""
  );

  for (const label of currentLabels.filter(isStatusLabel)) {
    await c.octokit.issues.removeLabel({
      owner: c.owner,
      repo: c.repo,
      issue_number: id,
      name: label,
    });
  }

  const newLabel = statusLabel(next);
  await c.octokit.issues.addLabels({
    owner: c.owner,
    repo: c.repo,
    issue_number: id,
    labels: [newLabel],
  });

  let finalState = issue.data.state;
  if (next === "approved" && issue.data.state === "open") {
    const closed = await c.octokit.issues.update({
      owner: c.owner,
      repo: c.repo,
      issue_number: id,
      state: "closed",
      state_reason: "completed",
    });
    finalState = closed.data.state;
  }

  return asTextContent({
    id,
    status: next,
    state: finalState,
    label: newLabel,
  });
}
