import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { LinearClient } from "../linear-client.js";
import { createIssue, createIssueTool } from "./createIssue.js";
import { getIssue, getIssueTool } from "./getIssue.js";
import { listIssues, listIssuesTool } from "./listIssues.js";
import { addComment, addCommentTool } from "./addComment.js";
import { updateStatus, updateStatusTool } from "./updateStatus.js";
import { linkArtifact, linkArtifactTool } from "./linkArtifact.js";
import { assign, assignTool } from "./assign.js";

export const tools: Tool[] = [
  createIssueTool,
  getIssueTool,
  listIssuesTool,
  addCommentTool,
  updateStatusTool,
  linkArtifactTool,
  assignTool,
];

export async function dispatch(
  name: string,
  args: Record<string, unknown>,
  client: LinearClient
) {
  switch (name) {
    case "mdops_create_issue":
      return createIssue(args, client);
    case "mdops_get_issue":
      return getIssue(args, client);
    case "mdops_list_issues":
      return listIssues(args, client);
    case "mdops_add_comment":
      return addComment(args, client);
    case "mdops_update_status":
      return updateStatus(args, client);
    case "mdops_link_artifact":
      return linkArtifact(args, client);
    case "mdops_assign":
      return assign(args, client);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function issueRefArg(arg: unknown): string {
  if (typeof arg === "string" && arg.trim() !== "") return arg.trim();
  if (typeof arg === "number" && Number.isFinite(arg)) return String(arg);
  throw new Error("id must be a non-empty string identifier or UUID");
}
