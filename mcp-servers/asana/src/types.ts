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

export interface AsanaTask {
  gid: string;
  name: string;
  notes?: string | null;
  completed?: boolean;
  permalink_url?: string;
  tags?: Array<{ gid: string; name: string }>;
  assignee?: { gid: string; name: string } | null;
  followers?: Array<{ gid: string; name: string }>;
  num_likes?: number;
  num_subtasks?: number;
  created_at?: string;
  modified_at?: string;
}

export interface AsanaStory {
  gid: string;
  text: string;
  created_at?: string;
}
