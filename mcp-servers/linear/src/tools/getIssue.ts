import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gql, type LinearClient } from "../linear-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  type LinearIssue,
} from "../types.js";
import { issueRefArg } from "./refs.js";

export const getIssueTool: Tool = {
  name: "mdops_get_issue",
  description: "Read a coordination unit (Linear Issue) by identifier or UUID.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Linear identifier (e.g. ENG-42) or UUID.",
      },
    },
    required: ["id"],
  },
};

export async function getIssue(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const ref = issueRefArg(args.id);

  const data = await gql<{ issue: LinearIssue | null }>(
    c,
    `query Issue($id: String!) {
      issue(id: $id) {
        id identifier title description url createdAt updatedAt
        state { name }
        labels { nodes { id name } }
        assignee { id name email }
      }
    }`,
    { id: ref }
  );

  if (!data.issue) throw new Error(`Linear issue not found: ${ref}`);
  const issue = data.issue;
  const labels = (issue.labels?.nodes ?? []).map((l) => l.name);
  const statusLabel = labels.find((l) => l.startsWith(STATUS_LABEL_PREFIX));

  return asTextContent({
    id: issue.identifier,
    url: issue.url,
    title: issue.title,
    body: issue.description ?? "",
    state: issue.state?.name ?? "unknown",
    status: statusLabel ? statusLabel.slice(STATUS_LABEL_PREFIX.length) : null,
    labels,
    assignees: issue.assignee ? [issue.assignee.name] : [],
    createdAt: issue.createdAt ?? null,
    updatedAt: issue.updatedAt ?? null,
  });
}
