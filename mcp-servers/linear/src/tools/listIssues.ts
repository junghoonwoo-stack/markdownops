import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gql, getTeamId, type LinearClient } from "../linear-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  statusLabel,
  type LinearIssue,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "Search and filter coordination units. Builds a Linear IssueFilter from the provided options.",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
      },
      assignee: {
        type: "string",
        description: "Email or display name.",
      },
      query: {
        type: "string",
        description: "Free-text query (matches title or description, case-insensitive).",
      },
      limit: {
        type: "number",
        description: "Maximum results. Default 30, max 100.",
      },
    },
  },
};

export async function listIssues(
  args: Record<string, unknown>,
  c: LinearClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const first = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const teamId = await getTeamId(c);
  const filter: Record<string, unknown> = { team: { id: { eq: teamId } } };

  if (status) {
    filter.labels = { name: { eq: statusLabel(status as Status) } };
  }
  if (assignee) {
    filter.assignee = assignee.includes("@")
      ? { email: { eq: assignee } }
      : { name: { eq: assignee } };
  }
  if (query) {
    filter.or = [
      { title: { containsIgnoreCase: query } },
      { description: { containsIgnoreCase: query } },
    ];
  }

  const data = await gql<{ issues: { nodes: LinearIssue[] } }>(
    c,
    `query Issues($filter: IssueFilter, $first: Int) {
      issues(filter: $filter, first: $first, orderBy: updatedAt) {
        nodes {
          id identifier title url updatedAt
          state { name }
          labels { nodes { name } }
          assignee { name }
        }
      }
    }`,
    { filter, first }
  );

  return asTextContent(
    data.issues.nodes.map((i) => {
      const labels = (i.labels?.nodes ?? []).map((l) => l.name);
      const statusFromLabel = labels.find((l) =>
        l.startsWith(STATUS_LABEL_PREFIX)
      );
      return {
        id: i.identifier,
        url: i.url,
        title: i.title,
        state: i.state?.name ?? "unknown",
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels,
        assignees: i.assignee ? [i.assignee.name] : [],
        updatedAt: i.updatedAt ?? null,
      };
    })
  );
}
