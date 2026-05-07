import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  asanaRequest,
  resolveUserGid,
  type AsanaClient,
} from "../asana-client.js";
import { asTextContent, type AsanaTask } from "../types.js";
import { taskGidArg } from "./refs.js";

export const assignTool: Tool = {
  name: "mdops_assign",
  description:
    "Set assignee + followers on a task. The first name becomes the assignee; the rest become followers.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Asana user names, emails, or GIDs.",
      },
    },
    required: ["id", "assignees"],
  },
};

export async function assign(
  args: Record<string, unknown>,
  c: AsanaClient
) {
  const id = taskGidArg(args.id);
  const assignees = Array.isArray(args.assignees)
    ? (args.assignees as string[])
    : [];
  if (assignees.length === 0) throw new Error("assignees must be non-empty");

  const [primary, ...rest] = assignees;
  const primaryGid = await resolveUserGid(c, primary);

  await asanaRequest(c, `/tasks/${id}`, {
    method: "PUT",
    body: { data: { assignee: primaryGid } },
  });

  const followerGids: string[] = [];
  for (const r of rest) {
    followerGids.push(await resolveUserGid(c, r));
  }
  if (followerGids.length > 0) {
    await asanaRequest(c, `/tasks/${id}/addFollowers`, {
      method: "POST",
      body: { data: { followers: followerGids } },
    });
  }

  const updated = await asanaRequest<{ data: AsanaTask }>(c, `/tasks/${id}`, {
    query: { opt_fields: "permalink_url,assignee.name,followers.name" },
  });
  const t = updated.data;
  return asTextContent({
    id,
    assignee: t.assignee?.name ?? null,
    followers: (t.followers ?? []).map((f) => f.name),
    url: t.permalink_url ?? "",
  });
}
