export interface AsanaClient {
  endpoint: string;
  pat: string;
  projectGid: string;
  workspaceGid?: string;
  defaultLabels: string[];
  artifactBase: string;
}

export interface CreateAsanaClientOptions {
  pat: string;
  projectGid: string;
  endpoint?: string;
  workspaceGid?: string;
  defaultLabels?: string[];
  artifactBase?: string;
}

export function createAsanaClient(opts: CreateAsanaClientOptions): AsanaClient {
  return {
    endpoint: (opts.endpoint ?? "https://app.asana.com/api/1.0").replace(/\/+$/, ""),
    pat: opts.pat,
    projectGid: opts.projectGid,
    workspaceGid: opts.workspaceGid,
    defaultLabels: opts.defaultLabels ?? [],
    artifactBase: (opts.artifactBase ?? "").replace(/\/+$/, ""),
  };
}

export interface AsanaRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function asanaRequest<T = unknown>(
  c: AsanaClient,
  path: string,
  opts: AsanaRequestOptions = {}
): Promise<T> {
  const url = new URL(`${c.endpoint}${path}`);
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
      Authorization: `Bearer ${c.pat}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getWorkspaceGid(c: AsanaClient): Promise<string> {
  if (c.workspaceGid) return c.workspaceGid;
  const data = await asanaRequest<{ data: { workspace: { gid: string } } }>(
    c,
    `/projects/${c.projectGid}`,
    { query: { opt_fields: "workspace.gid" } }
  );
  c.workspaceGid = data.data.workspace.gid;
  return c.workspaceGid;
}

export async function resolveTagGids(
  c: AsanaClient,
  names: string[]
): Promise<string[]> {
  if (names.length === 0) return [];
  const workspace = await getWorkspaceGid(c);
  const list = await asanaRequest<{ data: Array<{ gid: string; name: string }> }>(
    c,
    `/workspaces/${workspace}/tags`,
    { query: { opt_fields: "name", limit: 100 } }
  );
  const found = new Map(list.data.map((t) => [t.name, t.gid]));
  const ids: string[] = [];
  for (const name of names) {
    let gid = found.get(name);
    if (!gid) {
      const created = await asanaRequest<{ data: { gid: string; name: string } }>(
        c,
        `/tags`,
        { method: "POST", body: { data: { name, workspace } } }
      );
      gid = created.data.gid;
      found.set(name, gid);
    }
    ids.push(gid);
  }
  return ids;
}

export async function resolveUserGid(
  c: AsanaClient,
  query: string
): Promise<string> {
  const workspace = await getWorkspaceGid(c);
  const data = await asanaRequest<{
    data: Array<{ gid: string; name: string; email?: string }>;
  }>(c, `/users`, { query: { workspace, opt_fields: "name,email", limit: 100 } });
  const lower = query.toLowerCase();
  const match = data.data.find(
    (u) =>
      u.gid === query ||
      u.email?.toLowerCase() === lower ||
      u.name.toLowerCase() === lower
  );
  if (!match) throw new Error(`No Asana user found for: ${query}`);
  return match.gid;
}
