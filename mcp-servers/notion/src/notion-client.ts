export interface NotionClient {
  endpoint: string;
  apiKey: string;
  notionVersion: string;
  databaseId: string;
  defaultLabels: string[];
  artifactBase: string;
}

export interface CreateNotionClientOptions {
  apiKey: string;
  databaseId: string;
  endpoint?: string;
  notionVersion?: string;
  defaultLabels?: string[];
  artifactBase?: string;
}

export function createNotionClient(opts: CreateNotionClientOptions): NotionClient {
  return {
    endpoint: (opts.endpoint ?? "https://api.notion.com").replace(/\/+$/, ""),
    apiKey: opts.apiKey,
    notionVersion: opts.notionVersion ?? "2022-06-28",
    databaseId: opts.databaseId,
    defaultLabels: opts.defaultLabels ?? [],
    artifactBase: (opts.artifactBase ?? "").replace(/\/+$/, ""),
  };
}

export interface NotionRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function notionRequest<T = unknown>(
  c: NotionClient,
  path: string,
  opts: NotionRequestOptions = {}
): Promise<T> {
  const url = new URL(`${c.endpoint}/v1${path}`);
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
      Authorization: `Bearer ${c.apiKey}`,
      "Notion-Version": c.notionVersion,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
