import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createGitlabClient,
  type GitlabClient,
} from "../src/gitlab-client.js";
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
    const body =
      init?.body && typeof init.body === "string" ? JSON.parse(init.body) : undefined;
    const call: FetchCall = { url, method: init?.method ?? "GET", body, headers };
    calls.push(call);
    const next = responses[i++];
    const data = typeof next === "function" ? (next as Function)(call) : next;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

function makeClient(): GitlabClient {
  return createGitlabClient({
    host: "https://gitlab.example.com",
    token: "tok",
    project: "acme/demo",
    defaultLabels: ["markdownops"],
  });
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

describe("createGitlabClient", () => {
  it("URL-encodes path-style projects", () => {
    const c = createGitlabClient({
      host: "https://gitlab.com",
      token: "t",
      project: "group/sub/repo",
    });
    expect(c.encodedProject).toBe("group%2Fsub%2Frepo");
  });

  it("leaves numeric project IDs alone", () => {
    const c = createGitlabClient({
      host: "https://gitlab.com",
      token: "t",
      project: "12345",
    });
    expect(c.encodedProject).toBe("12345");
  });

  it("strips trailing slashes from host", () => {
    const c = createGitlabClient({
      host: "https://gitlab.example.com//",
      token: "t",
      project: "12345",
    });
    expect(c.host).toBe("https://gitlab.example.com");
  });
});

describe("mdops_create_issue", () => {
  it("looks up assignee usernames, posts the issue with default labels merged", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        [{ id: 7, username: "alice" }],
        {
          iid: 42,
          state: "opened",
          title: "T",
          labels: ["markdownops", "role:product"],
          assignees: [{ id: 7, username: "alice" }],
          web_url: "https://gitlab.example.com/acme/demo/-/issues/42",
        },
      ])
    );

    const client = makeClient();
    const result = await createIssue(
      { title: "T", body: "B", labels: ["role:product"], assignees: ["alice"] },
      client
    );

    expect(calls[0].url).toContain("/users?username=alice");
    expect(calls[1].url).toContain("/projects/acme%2Fdemo/issues");
    expect(calls[1].method).toBe("POST");
    expect(calls[1].body).toEqual({
      title: "T",
      description: "B",
      labels: "markdownops,role:product",
      assignee_ids: [7],
    });
    expect(calls[1].headers["PRIVATE-TOKEN"]).toBe("tok");

    expect(parsePayload(result)).toEqual({
      id: 42,
      url: "https://gitlab.example.com/acme/demo/-/issues/42",
      title: "T",
      state: "opened",
      labels: ["markdownops", "role:product"],
      assignees: ["alice"],
    });
  });

  it("requires title and body", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(createIssue({ body: "B" }, client)).rejects.toThrow(/title/);
    await expect(createIssue({ title: "T" }, client)).rejects.toThrow(/body/);
  });
});

describe("mdops_get_issue", () => {
  it("returns the issue with status extracted from label", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          iid: 7,
          web_url: "u",
          title: "Hi",
          description: "Body",
          state: "opened",
          labels: ["mdops:status:in-review", "markdownops"],
          assignees: [],
          user_notes_count: 2,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-02T00:00:00Z",
        },
      ])
    );

    const client = makeClient();
    const result = await getIssue({ id: 7 }, client);

    expect(calls[0].url).toContain("/projects/acme%2Fdemo/issues/7");
    expect(parsePayload(result).status).toBe("in-review");
    expect(parsePayload(result).comments).toBe(2);
  });
});

describe("mdops_list_issues", () => {
  it("passes filters as query params and maps the response", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        [
          {
            iid: 1,
            web_url: "u1",
            title: "Sales req for ACME",
            state: "opened",
            labels: ["mdops:status:in-review"],
            assignees: [{ username: "alice" }],
            updated_at: "t",
          },
        ],
      ])
    );

    const client = makeClient();
    const result = await listIssues(
      { status: "in-review", assignee: "alice", query: "ACME", limit: 50 },
      client
    );

    const url = new URL(calls[0].url);
    expect(url.pathname).toBe("/api/v4/projects/acme%2Fdemo/issues");
    expect(url.searchParams.get("state")).toBe("all");
    expect(url.searchParams.get("labels")).toBe("mdops:status:in-review");
    expect(url.searchParams.get("assignee_username")).toBe("alice");
    expect(url.searchParams.get("search")).toBe("ACME");
    expect(url.searchParams.get("per_page")).toBe("50");

    const items = parsePayload(result);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(1);
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("posts the note and returns metadata", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: 123, body: "## Review", created_at: "2026-01-01" }])
    );

    const client = makeClient();
    const result = await addComment({ id: 7, body: "## Review" }, client);

    expect(calls[0].url).toContain("/projects/acme%2Fdemo/issues/7/notes");
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ body: "## Review" });
    expect(parsePayload(result).commentId).toBe(123);
  });
});

describe("mdops_update_status", () => {
  it("removes prior status label, adds the new one, and closes on approved", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          iid: 9,
          state: "opened",
          labels: ["mdops:status:in-review", "markdownops"],
        },
        {
          iid: 9,
          state: "closed",
          labels: ["mdops:status:approved", "markdownops"],
        },
      ])
    );

    const client = makeClient();
    const result = await updateStatus({ id: 9, status: "approved" }, client);

    expect(calls[1].method).toBe("PUT");
    expect(calls[1].body).toEqual({
      add_labels: "mdops:status:approved",
      remove_labels: "mdops:status:in-review",
      state_event: "close",
    });
    expect(parsePayload(result)).toEqual({
      id: 9,
      status: "approved",
      state: "closed",
      label: "mdops:status:approved",
    });
  });

  it("rejects unknown status values", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(
      updateStatus({ id: 1, status: "shipped" }, client)
    ).rejects.toThrow();
  });
});

describe("mdops_link_artifact", () => {
  it("posts a comment with the constructed URL using project path", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: 1, body: "x", created_at: "t" }])
    );

    const client = makeClient();
    const result = await linkArtifact(
      {
        id: 7,
        artifact_path: "artifacts/sales-requirements.md",
        commit: "main",
      },
      client
    );

    expect(calls[0].body).toMatchObject({
      body: expect.stringContaining(
        "https://gitlab.example.com/acme/demo/-/blob/main/artifacts/sales-requirements.md"
      ),
    });
    expect(parsePayload(result).artifactUrl).toContain(
      "artifacts/sales-requirements.md"
    );
  });
});

describe("mdops_assign", () => {
  it("looks up each username and PUTs assignee_ids", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        [{ id: 11, username: "bob" }],
        [{ id: 12, username: "carol" }],
        {
          iid: 4,
          web_url: "u",
          assignees: [
            { id: 11, username: "bob" },
            { id: 12, username: "carol" },
          ],
        },
      ])
    );

    const client = makeClient();
    const result = await assign(
      { id: 4, assignees: ["bob", "carol"] },
      client
    );

    expect(calls[2].method).toBe("PUT");
    expect(calls[2].body).toEqual({ assignee_ids: [11, 12] });
    expect(parsePayload(result).assignees).toEqual(["bob", "carol"]);
  });

  it("throws if a username does not resolve", async () => {
    vi.stubGlobal("fetch", makeFetchMock([[]]));
    const client = makeClient();
    await expect(
      assign({ id: 4, assignees: ["ghost"] }, client)
    ).rejects.toThrow(/No GitLab user found/);
  });

  it("rejects empty assignees array", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(assign({ id: 1, assignees: [] }, client)).rejects.toThrow();
  });
});
