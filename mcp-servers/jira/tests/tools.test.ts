import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createJiraClient,
  type JiraClient,
} from "../src/jira-client.js";
import { createIssue } from "../src/tools/createIssue.js";
import { getIssue } from "../src/tools/getIssue.js";
import { listIssues } from "../src/tools/listIssues.js";
import { addComment } from "../src/tools/addComment.js";
import { updateStatus } from "../src/tools/updateStatus.js";
import { linkArtifact } from "../src/tools/linkArtifact.js";
import { assign } from "../src/tools/assign.js";
import { tools, dispatch } from "../src/tools/index.js";

interface FetchCall {
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string>;
}

let calls: FetchCall[];

function makeFetchMock(responses: Array<unknown | ((call: FetchCall) => unknown)>) {
  let i = 0;
  return vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const raw = init?.body as string | undefined;
    let body: unknown = undefined;
    if (typeof raw === "string") {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
    const call: FetchCall = { url, method: init?.method ?? "GET", body, headers };
    calls.push(call);
    const next = responses[i++];
    const data = typeof next === "function" ? (next as Function)(call) : next;
    return new Response(data === undefined ? "" : JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

function makeClient(overrides: Partial<JiraClient> = {}): JiraClient {
  const c = createJiraClient({
    email: "user@example.com",
    token: "tok",
    host: "https://acme.atlassian.net",
    project: "PROJ",
    issueType: "Task",
    defaultLabels: ["markdownops"],
    artifactBase: "https://github.com/owner/repo/blob/main",
  });
  return { ...c, ...overrides };
}

function parsePayload(result: { content: { text: string }[] }) {
  return JSON.parse(result.content[0].text);
}

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tool registry", () => {
  it("exposes the seven standard mdops_* tools", () => {
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "mdops_add_comment",
      "mdops_assign",
      "mdops_create_issue",
      "mdops_get_issue",
      "mdops_link_artifact",
      "mdops_list_issues",
      "mdops_update_status",
    ]);
  });

  it("rejects unknown tool names", async () => {
    const client = makeClient();
    await expect(dispatch("nope", {}, client)).rejects.toThrow(/Unknown tool/);
  });
});

describe("createJiraClient", () => {
  it("base64-encodes basic auth and strips trailing slashes", () => {
    const c = createJiraClient({
      email: "a@b.com",
      token: "x",
      host: "https://acme.atlassian.net//",
      project: "P",
    });
    expect(c.host).toBe("https://acme.atlassian.net");
    expect(c.authHeader.startsWith("Basic ")).toBe(true);
    const decoded = Buffer.from(c.authHeader.slice(6), "base64").toString("utf-8");
    expect(decoded).toBe("a@b.com:x");
  });
});

describe("mdops_create_issue", () => {
  it("looks up the first assignee, posts the issue, and re-fetches it", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        [{ accountId: "alice-id", displayName: "Alice", emailAddress: "alice@example.com" }],
        { id: "10001", key: "PROJ-1", self: "https://x" },
        {
          id: "10001",
          key: "PROJ-1",
          fields: {
            summary: "T",
            labels: ["markdownops", "role:product"],
            assignee: { accountId: "alice-id", displayName: "Alice" },
            status: { name: "To Do" },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await createIssue(
      { title: "T", body: "B", labels: ["role:product"], assignees: ["alice@example.com"] },
      client
    );

    expect(calls[0].url).toContain("/rest/api/2/user/search?query=alice%40example.com");
    expect(calls[1].url).toContain("/rest/api/2/issue");
    expect(calls[1].method).toBe("POST");
    expect(calls[1].body).toEqual({
      fields: {
        project: { key: "PROJ" },
        summary: "T",
        description: "B",
        issuetype: { name: "Task" },
        labels: ["markdownops", "role:product"],
        assignee: { accountId: "alice-id" },
      },
    });
    expect(calls[1].headers.Authorization).toMatch(/^Basic /);

    expect(parsePayload(result)).toEqual({
      id: "PROJ-1",
      url: "https://acme.atlassian.net/browse/PROJ-1",
      title: "T",
      state: "To Do",
      labels: ["markdownops", "role:product"],
      assignees: ["Alice"],
    });
  });
});

describe("mdops_get_issue", () => {
  it("reads by key and extracts status from label", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          id: "10001",
          key: "PROJ-7",
          fields: {
            summary: "Hi",
            description: "Body",
            labels: ["mdops:status:in-review", "markdownops"],
            assignee: null,
            status: { name: "In Progress" },
            comment: { total: 2 },
            created: "2026-01-01T00:00:00Z",
            updated: "2026-01-02T00:00:00Z",
          },
        },
      ])
    );

    const client = makeClient();
    const result = await getIssue({ id: "PROJ-7" }, client);

    expect(calls[0].url).toContain("/rest/api/2/issue/PROJ-7");
    const payload = parsePayload(result);
    expect(payload.id).toBe("PROJ-7");
    expect(payload.status).toBe("in-review");
    expect(payload.state).toBe("In Progress");
    expect(payload.comments).toBe(2);
  });

  it("rejects bad ids", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(getIssue({ id: 0 }, client)).rejects.toThrow();
    await expect(getIssue({ id: "" }, client)).rejects.toThrow();
  });
});

describe("mdops_list_issues", () => {
  it("builds JQL from filters", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          issues: [
            {
              id: "1",
              key: "PROJ-1",
              fields: {
                summary: "Sales req for ACME",
                labels: ["mdops:status:in-review"],
                assignee: { accountId: "a", displayName: "Alice" },
                status: { name: "To Do" },
                updated: "t",
              },
            },
          ],
          total: 1,
          maxResults: 50,
          startAt: 0,
        },
      ])
    );

    const client = makeClient();
    const result = await listIssues(
      { status: "in-review", assignee: "alice@example.com", query: "ACME", limit: 50 },
      client
    );

    const url = new URL(calls[0].url);
    expect(url.pathname).toBe("/rest/api/2/search");
    const jql = url.searchParams.get("jql") ?? "";
    expect(jql).toContain('project = "PROJ"');
    expect(jql).toContain('labels = "mdops:status:in-review"');
    expect(jql).toContain('assignee = "alice@example.com"');
    expect(jql).toContain('text ~ "ACME"');
    expect(url.searchParams.get("maxResults")).toBe("50");

    const items = parsePayload(result);
    expect(items[0].id).toBe("PROJ-1");
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("posts the comment", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: "c1", body: "## Review", created: "2026-01-01" }])
    );

    const client = makeClient();
    const result = await addComment({ id: "PROJ-7", body: "## Review" }, client);

    expect(calls[0].url).toContain("/rest/api/2/issue/PROJ-7/comment");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ body: "## Review" });
    expect(parsePayload(result).commentId).toBe("c1");
  });
});

describe("mdops_update_status", () => {
  it("removes prior status label and adds the new one via update.labels ops", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          id: "10009",
          key: "PROJ-9",
          fields: {
            summary: "x",
            labels: ["mdops:status:in-review", "markdownops"],
            status: { name: "In Progress" },
          },
        },
        undefined,
      ])
    );

    const client = makeClient();
    const result = await updateStatus(
      { id: "PROJ-9", status: "approved" },
      client
    );

    expect(calls[1].method).toBe("PUT");
    expect(calls[1].body).toEqual({
      update: {
        labels: [{ add: "mdops:status:approved" }, { remove: "mdops:status:in-review" }],
      },
    });
    expect(parsePayload(result)).toEqual({
      id: "PROJ-9",
      status: "approved",
      label: "mdops:status:approved",
      state: "In Progress",
    });
  });

  it("rejects unknown statuses", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(
      updateStatus({ id: "PROJ-1", status: "shipped" }, client)
    ).rejects.toThrow();
  });
});

describe("mdops_link_artifact", () => {
  it("uses the artifact base URL when configured", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: "c1", body: "x", created: "t" }])
    );
    const client = makeClient();

    const result = await linkArtifact(
      { id: "PROJ-7", artifact_path: "artifacts/sales-requirements.md" },
      client
    );

    expect(calls[0].body).toMatchObject({
      body: expect.stringContaining(
        "https://github.com/owner/repo/blob/main/artifacts/sales-requirements.md"
      ),
    });
    expect(parsePayload(result).artifactUrl).toContain(
      "artifacts/sales-requirements.md"
    );
  });

  it("falls back to plain path when no base configured", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: "c1", body: "x", created: "t" }])
    );
    const client = makeClient({ artifactBase: "" });

    const result = await linkArtifact(
      { id: "PROJ-7", artifact_path: "artifacts/sales-requirements.md" },
      client
    );

    expect(calls[0].body).toMatchObject({
      body: expect.stringContaining("artifacts/sales-requirements.md"),
    });
    expect(parsePayload(result).artifactUrl).toBeNull();
  });
});

describe("mdops_assign", () => {
  it("sets the first as assignee and the rest as watchers", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        [{ accountId: "alice-id", displayName: "Alice" }],
        undefined,
        [{ accountId: "bob-id", displayName: "Bob" }],
        undefined,
      ])
    );

    const client = makeClient();
    const result = await assign(
      { id: "PROJ-4", assignees: ["alice@example.com", "bob@example.com"] },
      client
    );

    expect(calls[1].url).toContain("/rest/api/2/issue/PROJ-4/assignee");
    expect(calls[1].method).toBe("PUT");
    expect(calls[1].body).toEqual({ accountId: "alice-id" });
    expect(calls[3].url).toContain("/rest/api/2/issue/PROJ-4/watchers");
    expect(calls[3].body).toBe("bob-id");

    expect(parsePayload(result)).toEqual({
      id: "PROJ-4",
      assignee: "alice-id",
      watchers: ["bob-id"],
      url: "https://acme.atlassian.net/browse/PROJ-4",
    });
  });

  it("rejects unresolvable usernames", async () => {
    vi.stubGlobal("fetch", makeFetchMock([[]]));
    const client = makeClient();
    await expect(
      assign({ id: "PROJ-1", assignees: ["ghost"] }, client)
    ).rejects.toThrow(/No Jira user/);
  });

  it("rejects empty assignees array", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(
      assign({ id: "PROJ-1", assignees: [] }, client)
    ).rejects.toThrow();
  });
});
