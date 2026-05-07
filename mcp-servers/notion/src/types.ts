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

/** Strip dashes from a Notion UUID for inclusion in URL paths. */
export function normalizeId(id: string): string {
  return id.replace(/-/g, "");
}

/** Re-insert the standard 8-4-4-4-12 hyphen pattern. */
export function hyphenateId(id: string): string {
  const clean = id.replace(/-/g, "");
  if (clean.length !== 32) return id;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

export interface NotionRichText {
  type: "text";
  text: { content: string; link?: { url: string } | null };
  annotations?: Record<string, unknown>;
  plain_text?: string;
}

export interface NotionBlock {
  object?: "block";
  id?: string;
  type: string;
  [key: string]: unknown;
}

export interface NotionPage {
  id: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionProperty {
  id?: string;
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  multi_select?: Array<{ id?: string; name: string; color?: string }>;
  select?: { name: string } | null;
  people?: Array<{ id: string; name?: string; person?: { email?: string } }>;
  status?: { name: string } | null;
}

export interface NotionUser {
  id: string;
  name?: string;
  person?: { email?: string };
}

export interface NotionComment {
  id: string;
  created_time: string;
}

export interface NotionDatabaseQueryResponse {
  results: NotionPage[];
  next_cursor?: string | null;
  has_more?: boolean;
}

export interface NotionBlockChildrenResponse {
  results: NotionBlock[];
}

export interface NotionUsersResponse {
  results: NotionUser[];
}
