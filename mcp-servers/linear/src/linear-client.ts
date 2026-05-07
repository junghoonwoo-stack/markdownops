export interface LinearClient {
  endpoint: string;
  apiKey: string;
  teamRef: string;
  defaultLabels: string[];
  artifactBase: string;
  _teamIdCache?: string;
}

export interface CreateLinearClientOptions {
  apiKey: string;
  teamRef: string;
  endpoint?: string;
  defaultLabels?: string[];
  artifactBase?: string;
}

export function createLinearClient(opts: CreateLinearClientOptions): LinearClient {
  return {
    endpoint: opts.endpoint ?? "https://api.linear.app/graphql",
    apiKey: opts.apiKey,
    teamRef: opts.teamRef,
    defaultLabels: opts.defaultLabels ?? [],
    artifactBase: (opts.artifactBase ?? "").replace(/\/+$/, ""),
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

export interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function gql<T>(
  c: LinearClient,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(c.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: c.apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Linear GraphQL ${res.status} ${res.statusText}: ${text.slice(0, 300)}`
    );
  }
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `Linear GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }
  if (!json.data) throw new Error("Linear GraphQL: empty response");
  return json.data;
}

export async function getTeamId(c: LinearClient): Promise<string> {
  if (c._teamIdCache) return c._teamIdCache;
  const data = await gql<{ team: { id: string } | null }>(
    c,
    `query Team($id: String!) { team(id: $id) { id } }`,
    { id: c.teamRef }
  );
  if (!data.team?.id) throw new Error(`Linear team not found: ${c.teamRef}`);
  c._teamIdCache = data.team.id;
  return c._teamIdCache;
}

export async function resolveIssueId(
  c: LinearClient,
  ref: string
): Promise<string> {
  if (isUuid(ref)) return ref;
  const data = await gql<{ issue: { id: string } | null }>(
    c,
    `query Issue($id: String!) { issue(id: $id) { id } }`,
    { id: ref }
  );
  if (!data.issue?.id) throw new Error(`Linear issue not found: ${ref}`);
  return data.issue.id;
}

export async function resolveLabelIds(
  c: LinearClient,
  names: string[]
): Promise<string[]> {
  if (names.length === 0) return [];
  const teamId = await getTeamId(c);
  const data = await gql<{
    issueLabels: { nodes: Array<{ id: string; name: string }> };
  }>(
    c,
    `query Labels($teamId: ID!) {
      issueLabels(filter: { team: { id: { eq: $teamId } } }, first: 250) {
        nodes { id name }
      }
    }`,
    { teamId }
  );
  const found = new Map(data.issueLabels.nodes.map((n) => [n.name, n.id]));

  const ids: string[] = [];
  for (const name of names) {
    let id = found.get(name);
    if (!id) {
      const created = await gql<{
        issueLabelCreate: {
          success: boolean;
          issueLabel: { id: string; name: string };
        };
      }>(
        c,
        `mutation LabelCreate($input: IssueLabelCreateInput!) {
          issueLabelCreate(input: $input) {
            success
            issueLabel { id name }
          }
        }`,
        { input: { name, teamId } }
      );
      if (!created.issueLabelCreate.success) {
        throw new Error(`Failed to create Linear label: ${name}`);
      }
      id = created.issueLabelCreate.issueLabel.id;
      found.set(name, id);
    }
    ids.push(id);
  }
  return ids;
}

export async function resolveUserId(
  c: LinearClient,
  query: string
): Promise<string> {
  const filter = query.includes("@")
    ? { email: { eq: query } }
    : { name: { eq: query } };
  const data = await gql<{
    users: { nodes: Array<{ id: string; name: string; email: string }> };
  }>(
    c,
    `query Users($filter: UserFilter) {
      users(filter: $filter, first: 1) {
        nodes { id name email }
      }
    }`,
    { filter }
  );
  const id = data.users.nodes[0]?.id;
  if (!id) throw new Error(`Linear user not found: ${query}`);
  return id;
}
