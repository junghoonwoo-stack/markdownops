import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type JiraIssue,
  type Status,
} from "../types.js";
import { issueRefArg } from "./refs.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a coordination unit's MarkdownOps status. Removes any prior mdops:status:* label and applies the new one. Does NOT change the Jira workflow status — wire that via Jira automation if needed.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        oneOf: [{ type: "number" }, { type: "string" }],
      },
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
  c: JiraClient
) {
  const ref = issueRefArg(args.id);
  const next = args.status as Status;
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(
      `status must be one of: ${STATUS_VALUES.join(", ")}, got: ${String(next)}`
    );
  }

  const current = await jiraRequest<JiraIssue>(
    c,
    `/issue/${encodeURIComponent(ref)}`
  );

  const removeLabels = (current.fields.labels ?? []).filter(isStatusLabel);
  const addLabel = statusLabel(next);

  const labelOps: Array<Record<string, string>> = [{ add: addLabel }];
  for (const label of removeLabels) labelOps.push({ remove: label });

  await jiraRequest(c, `/issue/${encodeURIComponent(ref)}`, {
    method: "PUT",
    body: { update: { labels: labelOps } },
  });

  return asTextContent({
    id: ref,
    status: next,
    label: addLabel,
    state: current.fields.status?.name ?? "unknown",
  });
}
