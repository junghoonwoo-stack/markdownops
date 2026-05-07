export interface GitlabClient {
  host: string;
  token: string;
  /** Numeric project id or URL-path with slashes (e.g. "namespace/repo"). */
  project: string;
  /** Project encoded for use in REST URLs (slashes become %2F). */
  encodedProject: string;
  defaultLabels: string[];
}

export interface CreateGitlabClientOptions {
  host: string;
  token: string;
  project: string;
  defaultLabels?: string[];
}

export function createGitlabClient(opts: CreateGitlabClientOptions): GitlabClient {
  const project = opts.project.trim();
  const encodedProject = /^\d+$/.test(project)
    ? project
    : encodeURIComponent(project);
  return {
    host: opts.host.replace(/\/+$/, ""),
    token: opts.token,
    project,
    encodedProject,
    defaultLabels: opts.defaultLabels ?? [],
  };
}

export interface GitlabRequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | undefined>;
}

export async function gitlabRequest<T = unknown>(
  c: GitlabClient,
  path: string,
  opts: GitlabRequestOptions = {}
): Promise<T> {
  const url = new URL(`${c.host}/api/v4${path}`);
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
      "PRIVATE-TOKEN": c.token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitLab API ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
