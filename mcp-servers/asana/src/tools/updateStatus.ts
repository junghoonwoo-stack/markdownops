import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  asanaRequest,
  resolveTagGids,
  type AsanaClient,
} from "../asana-client.js";
import {
  STATUS_VALUES,
  asTextContent,
  isStatusLabel,
  statusLabel,
  type AsanaTask,
  type Status,
} from "../types.js";
import { taskGidArg } from "./refs.js";

export const updateStatusTool: Tool = {
  name: "mdops_update_status",
  description:
    "Transition a task's MarkdownOps status by replacing the mdops:status:* tag. The task's completed flag is also flipped to true on 'approved'.",
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
  c: AsanaClient
) {
  const id = taskGidArg(args.id);
  const next = args.status as Status;
  if (!STATUS_VALUES.includes(next)) {
    throw new Error(`status must be one of: ${STATUS_VALUES.join(", ")}`);
  }

  const cur = await asanaRequest<{ data: AsanaTask }>(c, `/tasks/${id}`, {
    query: { opt_fields: "tags.name,completed" },
  });
  const task = cur.data;
  const currentTags = task.tags ?? [];

  // Remove every existing mdops:status:* tag
  for (const tag of currentTags.filter((t) => isStatusLabel(t.name))) {
    await asanaRequest(c, `/tasks/${id}/removeTag`, {
      method: "POST",
      body: { data: { tag: tag.gid } },
    });
  }

  // Add the new status tag
  const [newTagGid] = await resolveTagGids(c, [statusLabel(next)]);
  await asanaRequest(c, `/tasks/${id}/addTag`, {
    method: "POST",
    body: { data: { tag: newTagGid } },
  });

  // Flip completed flag if approved
  let completed = task.completed;
  if (next === "approved" && !completed) {
    const updated = await asanaRequest<{ data: AsanaTask }>(c, `/tasks/${id}`, {
      method: "PUT",
      body: { data: { completed: true } },
      query: { opt_fields: "completed" },
    });
    completed = updated.data.completed;
  }

  return asTextContent({
    id,
    status: next,
    state: completed ? "completed" : "active",
    label: statusLabel(next),
  });
}
