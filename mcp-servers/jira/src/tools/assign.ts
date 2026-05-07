import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { jiraRequest, type JiraClient } from "../jira-client.js";
import { asTextContent, type JiraUser } from "../types.js";
import { issueRefArg } from "./index.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set reviewers / owners on a coordination unit. The first name becomes the issue assignee; the rest are added as watchers.",
  inputSchema: {
    type: "object",
    properties: {
      id: { oneOf: [{ type: "number" }, { type: "string" }] },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Emails or display names to resolve to Jira accountIds.",
      },
    },
    required: ["id", "assignees"],
  },
};

async function resolveAccountId(c: JiraClient, query: string): Promise<string> {
  const users = await jiraRequest<JiraUser[]>(c, `/user/search`, {
    query: { query },
  });
  if (!users[0]?.accountId) {
    throw new Error(`No Jira user found for: ${query}`);
  }
  return users[0].accountId;
}

export async function assign(
  args: Record<string, unknown>,
  c: JiraClient
) {
  const ref = issueRefArg(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const [primary, ...watcherNames] = assignees;

  const primaryId = await resolveAccountId(c, primary);
  await jiraRequest(c, `/issue/${encodeURIComponent(ref)}/assignee`, {
    method: "PUT",
    body: { accountId: primaryId },
  });

  const watcherIds: string[] = [];
  for (const name of watcherNames) {
    const id = await resolveAccountId(c, name);
    await jiraRequest(c, `/issue/${encodeURIComponent(ref)}/watchers`, {
      method: "POST",
      body: id,
    });
    watcherIds.push(id);
  }

  return asTextContent({
    id: ref,
    assignee: primaryId,
    watchers: watcherIds,
    url: `${c.host}/browse/${ref}`,
  });
}
