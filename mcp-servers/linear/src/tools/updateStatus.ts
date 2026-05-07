import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  gql,
  resolveIssueId,
  resolveLabelIds,
  type LinearClient,
} from "../linear-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type LinearIssue,
  type Status,
} from "../types.js";
import { issueRefArg } from "./index.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a coordination unit's MarkdownOps status. Removes any prior mdops:status:* label and applies the new one. Linear's workflow state is not changed.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      status: { type: "string", enum: [...STATUS_VALUES] },
    },
    required: ["id", "status"],
  },
};

export async function updateStatus(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const ref = issueRefArg(args.id);
  const next = args.status as Status;
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(
      `status must be one of: ${STATUS_VALUES.join(", ")}, got: ${String(next)}`
    );
  }

  const issueId = await resolveIssueId(c, ref);

  const current = await gql<{
    issue: { labels: { nodes: Array<{ id: string; name: string }> } } | null;
  }>(
    c,
    `query Issue($id: String!) {
      issue(id: $id) {
        labels { nodes { id name } }
      }
    }`,
    { id: issueId }
  );
  if (!current.issue) throw new Error(`Linear issue not found: ${ref}`);

  const keptLabelIds = current.issue.labels.nodes
    .filter((l) => !isStatusLabel(l.name))
    .map((l) => l.id);

  const [newStatusLabelId] = await resolveLabelIds(c, [statusLabel(next)]);

  const updated = await gql<{
    issueUpdate: { success: boolean; issue: LinearIssue };
  }>(
    c,
    `mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id identifier
          state { name }
          labels { nodes { name } }
        }
      }
    }`,
    { id: issueId, input: { labelIds: [...keptLabelIds, newStatusLabelId] } }
  );
  if (!updated.issueUpdate.success) {
    throw new Error("Linear issueUpdate returned success=false");
  }

  return asTextContent({
    id: ref,
    status: next,
    label: statusLabel(next),
    state: updated.issueUpdate.issue.state?.name ?? "unknown",
  });
}
