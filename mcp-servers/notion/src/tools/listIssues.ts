import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  notionRequest,
  type NotionClient,
} from "../notion-client.js";
import {
  STATUS_LABEL_PREFIX,
  asTextContent,
  statusLabel,
  type NotionDatabaseQueryResponse,
  type NotionPage,
  type Status,
} from "../types.js";

export const listIssuesTool: Tool = {
  name: "mdops_list_issues",
  description:
    "Search and filter coordination units in the configured Notion database.",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "in-review", "approved", "changes-requested", "blocked"],
      },
      assignee: {
        type: "string",
        description: "Notion user ID, name, or email.",
      },
      query: {
        type: "string",
        description: "Free-text query — matched against Name (title) property.",
      },
      limit: {
        type: "number",
        description: "Max results. Default 30, max 100.",
      },
    },
  },
};

function titleOf(page: NotionPage): string {
  for (const [, prop] of Object.entries(page.properties)) {
    if (prop.type === "title" && Array.isArray(prop.title)) {
      return prop.title.map((t) => t.plain_text ?? t.text?.content ?? "").join("");
    }
  }
  return "";
}

export async function listIssues(
  args: Record<string, unknown>,
  c: NotionClient
) {
  const status = args.status as string | undefined;
  const assignee = args.assignee as string | undefined;
  const query = args.query as string | undefined;
  const pageSize = Math.min(Math.max(Number(args.limit ?? 30), 1), 100);

  const filters: Array<Record<string, unknown>> = [];
  if (status) {
    filters.push({
      property: "Tags",
      multi_select: { contains: statusLabel(status as Status) },
    });
  }
  if (query) {
    filters.push({ property: "Name", title: { contains: query } });
  }
  if (assignee) {
    // Notion's people filter accepts a user id directly.
    // Callers passing a name/email should use mdops_assign upstream first.
    filters.push({ property: "Assignees", people: { contains: assignee } });
  }

  const filter =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : { and: filters };

  const body: Record<string, unknown> = { page_size: pageSize };
  if (filter) body.filter = filter;
  body.sorts = [{ timestamp: "last_edited_time", direction: "descending" }];

  const data = await notionRequest<NotionDatabaseQueryResponse>(
    c,
    `/databases/${c.databaseId}/query`,
    { method: "POST", body }
  );

  return asTextContent(
    data.results.map((p) => {
      const labels = (p.properties.Tags?.multi_select ?? []).map((t) => t.name);
      const statusFromLabel = labels.find((l) =>
        l.startsWith(STATUS_LABEL_PREFIX)
      );
      const assignees = (p.properties.Assignees?.people ?? []).map(
        (u) => u.name ?? u.id
      );
      return {
        id: p.id,
        url: p.url,
        title: titleOf(p),
        state: "active",
        status: statusFromLabel
          ? statusFromLabel.slice(STATUS_LABEL_PREFIX.length)
          : null,
        labels,
        assignees,
        updatedAt: p.last_edited_time,
      };
    })
  );
}
