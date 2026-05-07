export interface JiraClient {
  host: string;
  authHeader: string;
  project: string;
  issueType: string;
  defaultLabels: string[];
  artifactBase: string;
}

export interface CreateJiraClientOptions {
  email: string;
  token: string;
  host: string;
  project: string;
  issueType?: string;
  defaultLabels?: string[];
  artifactBase?: string;
}

function basicAuth(email: string, token: string): string {
  const raw = `${email}:${token}`;
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(raw, "utf-8").toString("base64")
      : btoa(raw);
  return `Basic ${encoded}`;
}

export function createJiraClient(opts: CreateJiraClientOptions): JiraClient {
  return {
    host: opts.host.replace(/\/+$/, ""),
    authHeader: basicAuth(opts.email, opts.token),
    project: opts.project,
    issueType: opts.issueType ?? "Task",
    defaultLabels: opts.defaultLabels ?? [],
    artifactBase: (opts.artifactBase ?? "").replace(/\/+$/, ""),
  };
}

export interface JiraRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function jiraRequest<T = unknown>(
  c: JiraClient,
  path: string,
  opts: JiraRequestOptions = {}
): Promise<T> {
  const url = new URL(`${c.host}/rest/api/2${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      Authorization: c.authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  const ctype = res.headers.get("content-type") ?? "";
  if (!ctype.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}
