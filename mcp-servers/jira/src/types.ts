export const STATUS_VALUES = [
  "draft",
  "in-review",
  "approved",
  "changes-requested",
  "blocked",
] as const;

export type Status = (typeof STATUS_VALUES)[number];

export const STATUS_LABEL_PREFIX = "mdops:status:";

export function statusLabel(status: Status): string {
  return `${STATUS_LABEL_PREFIX}${status}`;
}

export function isStatusLabel(label: string): boolean {
  return label.startsWith(STATUS_LABEL_PREFIX);
}

export function asTextContent(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  };
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
}

export interface JiraIssueFields {
  summary: string;
  description?: string | null;
  labels?: string[];
  assignee?: JiraUser | null;
  status?: { name: string };
  comment?: { total: number };
  created?: string;
  updated?: string;
  issuetype?: { name: string };
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraComment {
  id: string;
  body: string;
  created: string;
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}
