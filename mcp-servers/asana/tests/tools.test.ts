import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createAsanaClient,
  type AsanaClient,
} from "../src/asana-client.js";
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

function makeFetchMock(responses: Array<unknown | ((c: FetchCall) => unknown)>) {
  let i = 0;
  return vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const raw = init?.body as string | undefined;
    let body: unknown = undefined;
    if (typeof raw === "string") {
      try { body = JSON.parse(raw); } catch { body = raw; }
    }
    const call: FetchCall = { url, method: init?.method ?? "GET", body, headers };
    calls.push(call);
    const next = responses[i++];
    const data = typeof next === "function" ? (next as Function)(call) : next;
    if (data === undefined) return new Response(null, { status: 204 });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

function makeClient(overrides: Partial<AsanaClient> = {}): AsanaClient {
  const c = createAsanaClient({
    pat: "pat-test",
    projectGid: "proj-1",
    workspaceGid: "ws-1",
    defaultLabels: ["markdownops"],
    artifactBase: "https://github.com/owner/repo/blob/main",
  });
  return { ...c, ...overrides };
}

const parsePayload = (r: { content: { text: string }[] }) =>
  JSON.parse(r.content[0].text);

beforeEach(() => { calls = []; });
afterEach(() => { vi.unstubAllGlobals(); });

describe("tool registry", () => {
  it("exposes the seven standard mdops_* tools", () => {
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "mdops_add_comment", "mdops_assign", "mdops_create_issue",
      "mdops_get_issue", "mdops_link_artifact", "mdops_list_issues",
      "mdops_update_status",
    ]);
  });
  it("rejects unknown tool names", async () => {
    await expect(dispatch("nope", {}, makeClient())).rejects.toThrow(/Unknown tool/);
  });
});

describe("mdops_create_issue", () => {
  it("resolves tags and assignee, then creates the task", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // resolveTagGids: list workspace tags
        { data: [{ gid: "tag-mdops", name: "markdownops" }] },
        // create new tag for "role:product"
        { data: { gid: "tag-product", name: "role:product" } },
        // resolveUserGid
        { data: [{ gid: "user-alice", name: "Alice", email: "alice@example.com" }] },
        // POST /tasks
        {
          data: {
            gid: "task-1",
            name: "T",
            permalink_url: "https://app.asana.com/0/proj-1/task-1",
            completed: false,
            tags: [
              { gid: "tag-mdops", name: "markdownops" },
              { gid: "tag-product", name: "role:product" },
            ],
            assignee: { gid: "user-alice", name: "Alice" },
          },
        },
      ])
    );

    const result = await createIssue(
      { title: "T", body: "B", labels: ["role:product"], assignees: ["alice@example.com"] },
      makeClient()
    );

    expect(calls[0].url).toContain("/workspaces/ws-1/tags");
    expect(calls[1].body).toEqual({ data: { name: "role:product", workspace: "ws-1" } });
    expect(calls[2].url).toContain("/users");
    expect(calls[3].url).toContain("/tasks");
    expect((calls[3].body as any).data).toEqual({
      name: "T",
      notes: "B",
      projects: ["proj-1"],
      tags: ["tag-mdops", "tag-product"],
      assignee: "user-alice",
    });

    expect(parsePayload(result)).toEqual({
      id: "task-1",
      url: "https://app.asana.com/0/proj-1/task-1",
      title: "T",
      state: "active",
      labels: ["markdownops", "role:product"],
      assignees: ["Alice"],
    });
  });
});

describe("mdops_get_issue", () => {
  it("returns the task with status from tag", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          data: {
            gid: "task-1",
            name: "Hi",
            notes: "Body",
            permalink_url: "u",
            completed: false,
            tags: [
              { gid: "1", name: "mdops:status:in-review" },
              { gid: "2", name: "markdownops" },
            ],
            assignee: { gid: "u-1", name: "Alice" },
            created_at: "2026-01-01",
            modified_at: "2026-01-02",
          },
        },
      ])
    );
    const result = await getIssue({ id: "task-1" }, makeClient());
    expect(parsePayload(result).status).toBe("in-review");
    expect(parsePayload(result).state).toBe("active");
  });
});

describe("mdops_list_issues", () => {
  it("post-filters by status, assignee, and query", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          data: [
            {
              gid: "1", name: "Sales req for ACME", notes: "x",
              completed: false, permalink_url: "u1",
              tags: [{ name: "mdops:status:in-review" }],
              assignee: { name: "Alice" },
              modified_at: "t",
            },
            {
              gid: "2", name: "Other", notes: "y",
              completed: false, permalink_url: "u2",
              tags: [{ name: "mdops:status:in-review" }],
              assignee: { name: "Alice" },
              modified_at: "t",
            },
            {
              gid: "3", name: "ACME but draft", notes: "z",
              completed: false, permalink_url: "u3",
              tags: [{ name: "mdops:status:draft" }],
              assignee: { name: "Alice" },
              modified_at: "t",
            },
          ],
        },
      ])
    );

    const result = await listIssues(
      { status: "in-review", assignee: "Alice", query: "ACME", limit: 50 },
      makeClient()
    );
    const items = parsePayload(result);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("1");
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("posts a story", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ data: { gid: "story-1", text: "x", created_at: "t" } }])
    );
    const result = await addComment({ id: "task-1", body: "## Review" }, makeClient());
    expect(calls[0].url).toContain("/tasks/task-1/stories");
    expect((calls[0].body as any).data.text).toBe("## Review");
    expect(parsePayload(result).commentId).toBe("story-1");
  });
});

describe("mdops_update_status", () => {
  it("removes prior status tag, adds the new one, and completes when approved", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // GET current task
        {
          data: {
            tags: [
              { gid: "tag-old", name: "mdops:status:in-review" },
              { gid: "tag-mdops", name: "markdownops" },
            ],
            completed: false,
          },
        },
        // removeTag
        undefined,
        // resolveTagGids: list
        { data: [{ gid: "tag-mdops", name: "markdownops" }] },
        // create new status tag
        {
          data: { gid: "tag-approved", name: "mdops:status:approved" },
        },
        // addTag
        undefined,
        // PUT completed=true
        { data: { completed: true } },
      ])
    );

    const result = await updateStatus(
      { id: "task-1", status: "approved" },
      makeClient()
    );

    // calls: GET task, removeTag, list tags, create new tag, addTag, PUT completed
    expect(calls[1].url).toContain("/tasks/task-1/removeTag");
    expect((calls[1].body as any).data).toEqual({ tag: "tag-old" });
    expect(calls[4].url).toContain("/tasks/task-1/addTag");
    expect((calls[4].body as any).data).toEqual({ tag: "tag-approved" });
    expect(calls[5].method).toBe("PUT");
    expect((calls[5].body as any).data).toEqual({ completed: true });

    expect(parsePayload(result)).toEqual({
      id: "task-1",
      status: "approved",
      state: "completed",
      label: "mdops:status:approved",
    });
  });
});

describe("mdops_link_artifact", () => {
  it("posts a story with the constructed URL", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ data: { gid: "story-1", text: "x", created_at: "t" } }])
    );
    const result = await linkArtifact(
      { id: "task-1", artifact_path: "artifacts/sales-requirements.md" },
      makeClient()
    );
    const text = (calls[0].body as any).data.text as string;
    expect(text).toContain("https://github.com/owner/repo/blob/main/artifacts/sales-requirements.md");
    expect(parsePayload(result).artifactUrl).toContain("artifacts/sales-requirements.md");
  });
});

describe("mdops_assign", () => {
  it("PUTs the assignee, then addFollowers for the rest", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // resolveUserGid for primary (alice)
        { data: [{ gid: "u-alice", name: "Alice", email: "alice@example.com" }] },
        // PUT assignee
        undefined,
        // resolveUserGid for bob
        { data: [{ gid: "u-bob", name: "Bob", email: "bob@example.com" }] },
        // addFollowers
        undefined,
        // GET final
        {
          data: {
            permalink_url: "u",
            assignee: { gid: "u-alice", name: "Alice" },
            followers: [{ gid: "u-bob", name: "Bob" }],
          },
        },
      ])
    );

    const result = await assign(
      { id: "task-1", assignees: ["alice@example.com", "bob@example.com"] },
      makeClient()
    );

    expect(calls[1].method).toBe("PUT");
    expect((calls[1].body as any).data).toEqual({ assignee: "u-alice" });
    expect(calls[3].url).toContain("/tasks/task-1/addFollowers");
    expect((calls[3].body as any).data).toEqual({ followers: ["u-bob"] });

    expect(parsePayload(result)).toEqual({
      id: "task-1",
      assignee: "Alice",
      followers: ["Bob"],
      url: "u",
    });
  });

  it("rejects empty assignees", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(
      assign({ id: "task-1", assignees: [] }, makeClient())
    ).rejects.toThrow();
  });
});
