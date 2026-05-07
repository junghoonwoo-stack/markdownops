import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  gql,
  getTeamId,
  resolveLabelIds,
  resolveUserId,
  type LinearClient,
} from "../linear-client.js";
import { asTextContent, type LinearIssue } from "../types.js";

export const createIssueTool: Tool = {
  name: "mdops_create_issue",
  description:
    "Create a coordination unit (Linear Issue) for a MarkdownOps artifact.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string", description: "Issue description (Markdown)." },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Optional labels in addition to MDOPS_DEFAULT_LABELS. Auto-created if missing.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Email or display name. The first becomes assignee.",
      },
    },
    required: ["title", "body"],
  },
};

export async function createIssue(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const title = String(args.title ?? "");
  const body = String(args.body ?? "");
  const extraLabels = Array.isArray(args.labels) ? (args.labels as string[]) : [];
  const assigneeNames = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];

  if (!title) throw new Error("title is required");
  if (!body) throw new Error("body is required");

  const teamId = await getTeamId(c);
  const allLabels = Array.from(new Set([...c.defaultLabels, ...extraLabels]));
  const labelIds = await resolveLabelIds(c, allLabels);
  const assigneeId =
    assigneeNames.length > 0 ? await resolveUserId(c, assigneeNames[0]) : null;

  const input: Record<string, unknown> = { teamId, title, description: body };
  if (labelIds.length > 0) input.labelIds = labelIds;
  if (assigneeId) input.assigneeId = assigneeId;

  const data = await gql<{
    issueCreate: { success: boolean; issue: LinearIssue };
  }>(
    c,
    `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id identifier title url
          state { name }
          labels { nodes { id name } }
          assignee { id name email }
        }
      }
    }`,
    { input }
  );

  if (!data.issueCreate.success) {
    throw new Error("Linear issueCreate returned success=false");
  }
  const issue = data.issueCreate.issue;
  return asTextContent({
    id: issue.identifier,
    url: issue.url,
    title: issue.title,
    state: issue.state?.name ?? "unknown",
    labels: (issue.labels?.nodes ?? []).map((l) => l.name),
    assignees: issue.assignee ? [issue.assignee.name] : [],
  });
}
