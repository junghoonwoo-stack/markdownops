import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  gql,
  resolveIssueId,
  resolveUserId,
  type LinearClient,
} from "../linear-client.js";
import { asTextContent, type LinearIssue } from "../types.js";
import { issueRefArg } from "./index.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set reviewers / owners on a coordination unit. The first name becomes the issue assignee; the rest are added as subscribers.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Emails or display names to resolve to Linear user IDs.",
      },
    },
    required: ["id", "assignees"],
  },
};

export async function assign(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const ref = issueRefArg(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const issueId = await resolveIssueId(c, ref);

  const [primary, ...subscribers] = assignees;
  const primaryId = await resolveUserId(c, primary);
  const subscriberIds: string[] = [];
  for (const name of subscribers) {
    subscriberIds.push(await resolveUserId(c, name));
  }

  const input: Record<string, unknown> = { assigneeId: primaryId };
  if (subscriberIds.length > 0) input.subscriberIds = subscriberIds;

  const data = await gql<{
    issueUpdate: { success: boolean; issue: LinearIssue };
  }>(
    c,
    `mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id identifier url
          assignee { id name }
          subscribers { nodes { id name } }
        }
      }
    }`,
    { id: issueId, input }
  );
  if (!data.issueUpdate.success) {
    throw new Error("Linear issueUpdate returned success=false");
  }
  const issue = data.issueUpdate.issue;

  return asTextContent({
    id: ref,
    assignee: issue.assignee?.name ?? null,
    subscribers: (issue.subscribers?.nodes ?? []).map((s) => s.name),
    url: issue.url,
  });
}
