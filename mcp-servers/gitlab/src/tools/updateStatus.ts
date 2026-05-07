import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gitlabRequest, type GitlabClient } from "../gitlab-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type GitlabIssue,
  type Status,
} from "../types.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a coordination unit's MarkdownOps status. Removes any prior mdops:status:* label and applies the new one. Closes the issue when the new status is 'approved'.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "GitLab issue iid." },
      status: {
        type: "string",
        enum: [...STATUS_VALUES],
      },
    },
    required: ["id", "status"],
  },
};

export async function updateStatus(
  args: Record<string, unknown>,
  c: GitlabClient
) {
  const id = Number(args.id);
  const next = args.status as Status;
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("id must be a positive integer issue iid");
  }
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(
      `status must be one of: ${STATUS_VALUES.join(", ")}, got: ${String(next)}`
    );
  }

  const current = await gitlabRequest<GitlabIssue>(
    c,
    `/projects/${c.encodedProject}/issues/${id}`
  );

  const removeLabels = (current.labels ?? []).filter(isStatusLabel);
  const addLabel = statusLabel(next);

  const body: Record<string, unknown> = {
    add_labels: addLabel,
  };
  if (removeLabels.length > 0) body.remove_labels = removeLabels.join(",");
  if (next === "approved" && current.state === "opened") {
    body.state_event = "close";
  }

  const updated = await gitlabRequest<GitlabIssue>(
    c,
    `/projects/${c.encodedProject}/issues/${id}`,
    {
      method: "PUT",
      body,
    }
  );

  return asTextContent({
    id,
    status: next,
    state: updated.state,
    label: addLabel,
  });
}
