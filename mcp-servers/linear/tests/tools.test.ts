import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createLinearClient,
  type LinearClient,
} from "../src/linear-client.js";
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
  body: { query: string; variables?: Record<string, unknown> };
  headers: Record<string, string>;
}

let calls: FetchCall[];

function makeFetchMock(responses: Array<unknown | ((call: FetchCall) => unknown)>) {
  let i = 0;
  return vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const raw = init?.body as string;
    const body = raw ? JSON.parse(raw) : { query: "" };
    const call: FetchCall = { url, body, headers };
    calls.push(call);
    const next = responses[i++];
    const data = typeof next === "function" ? (next as Function)(call) : next;
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

function makeClient(overrides: Partial<LinearClient> = {}): LinearClient {
  const c = createLinearClient({
    apiKey: "lin_api_test",
    teamRef: "ENG",
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

describe("mdops_create_issue", () => {
  it("resolves team / labels / assignee, then creates issue", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        { team: { id: "team-uuid" } },
        { issueLabels: { nodes: [{ id: "lbl-mdops", name: "markdownops" }] } },
        {
          issueLabelCreate: {
            success: true,
            issueLabel: { id: "lbl-product", name: "role:product" },
          },
        },
        {
          users: {
            nodes: [{ id: "user-alice", name: "Alice", email: "alice@example.com" }],
          },
        },
        {
          issueCreate: {
            success: true,
            issue: {
              id: "issue-uuid",
              identifier: "ENG-1",
              title: "T",
              url: "https://linear.app/x/issue/ENG-1",
              state: { name: "Backlog" },
              labels: {
                nodes: [
                  { id: "lbl-mdops", name: "markdownops" },
                  { id: "lbl-product", name: "role:product" },
                ],
              },
              assignee: { id: "user-alice", name: "Alice", email: "alice@example.com" },
            },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await createIssue(
      { title: "T", body: "B", labels: ["role:product"], assignees: ["alice@example.com"] },
      client
    );

    expect(calls[0].headers.Authorization).toBe("lin_api_test");
    expect(calls[0].body.query).toContain("query Team");
    expect(calls[1].body.query).toContain("query Labels");
    expect(calls[2].body.query).toContain("LabelCreate");
    expect(calls[2].body.variables).toEqual({
      input: { name: "role:product", teamId: "team-uuid" },
    });
    expect(calls[3].body.query).toContain("query Users");
    expect(calls[4].body.query).toContain("IssueCreate");
    expect(calls[4].body.variables).toEqual({
      input: {
        teamId: "team-uuid",
        title: "T",
        description: "B",
        labelIds: ["lbl-mdops", "lbl-product"],
        assigneeId: "user-alice",
      },
    });

    expect(parsePayload(result)).toEqual({
      id: "ENG-1",
      url: "https://linear.app/x/issue/ENG-1",
      title: "T",
      state: "Backlog",
      labels: ["markdownops", "role:product"],
      assignees: ["Alice"],
    });
  });
});

describe("mdops_get_issue", () => {
  it("returns the issue with status from label", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          issue: {
            id: "issue-uuid",
            identifier: "ENG-7",
            title: "Hi",
            description: "Body",
            url: "u",
            createdAt: "2026-01-01",
            updatedAt: "2026-01-02",
            state: { name: "In Progress" },
            labels: {
              nodes: [
                { id: "1", name: "mdops:status:in-review" },
                { id: "2", name: "markdownops" },
              ],
            },
            assignee: null,
          },
        },
      ])
    );

    const client = makeClient();
    const result = await getIssue({ id: "ENG-7" }, client);
    const payload = parsePayload(result);
    expect(payload.id).toBe("ENG-7");
    expect(payload.status).toBe("in-review");
    expect(payload.state).toBe("In Progress");
  });
});

describe("mdops_list_issues", () => {
  it("builds an IssueFilter and maps response", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        { team: { id: "team-uuid" } },
        {
          issues: {
            nodes: [
              {
                id: "1",
                identifier: "ENG-1",
                title: "Sales req for ACME",
                url: "u1",
                updatedAt: "t",
                state: { name: "Todo" },
                labels: { nodes: [{ name: "mdops:status:in-review" }] },
                assignee: { name: "Alice" },
              },
            ],
          },
        },
      ])
    );

    const client = makeClient();
    const result = await listIssues(
      { status: "in-review", assignee: "alice@example.com", query: "ACME", limit: 50 },
      client
    );

    const issuesCall = calls[1];
    const filter = (issuesCall.body.variables as any).filter;
    expect(filter.team).toEqual({ id: { eq: "team-uuid" } });
    expect(filter.labels).toEqual({ name: { eq: "mdops:status:in-review" } });
    expect(filter.assignee).toEqual({ email: { eq: "alice@example.com" } });
    expect(filter.or).toEqual([
      { title: { containsIgnoreCase: "ACME" } },
      { description: { containsIgnoreCase: "ACME" } },
    ]);
    expect(issuesCall.body.variables?.first).toBe(50);

    const items = parsePayload(result);
    expect(items[0].id).toBe("ENG-1");
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("resolves identifier and creates a comment", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        { issue: { id: "issue-uuid" } },
        {
          commentCreate: {
            success: true,
            comment: { id: "c1", createdAt: "2026-01-01" },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await addComment({ id: "ENG-7", body: "## Review" }, client);

    expect(calls[0].body.query).toContain("query Issue");
    expect(calls[1].body.variables).toEqual({
      input: { issueId: "issue-uuid", body: "## Review" },
    });
    expect(parsePayload(result).commentId).toBe("c1");
  });
});

describe("mdops_update_status", () => {
  it("keeps non-status labels, adds the new status label", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // resolveIssueId
        { issue: { id: "issue-uuid" } },
        // current labels
        {
          issue: {
            labels: {
              nodes: [
                { id: "lbl-status-old", name: "mdops:status:in-review" },
                { id: "lbl-md", name: "markdownops" },
              ],
            },
          },
        },
        // resolveLabelIds: list existing labels (status label not present)
        { issueLabels: { nodes: [{ id: "lbl-md", name: "markdownops" }] } },
        // create the new status label
        {
          issueLabelCreate: {
            success: true,
            issueLabel: { id: "lbl-status-new", name: "mdops:status:approved" },
          },
        },
        // issueUpdate
        {
          issueUpdate: {
            success: true,
            issue: {
              id: "issue-uuid",
              identifier: "ENG-9",
              state: { name: "In Progress" },
              labels: {
                nodes: [
                  { name: "markdownops" },
                  { name: "mdops:status:approved" },
                ],
              },
            },
          },
        },
      ])
    );

    const client = makeClient();
    // pre-populate team cache so we don't need a Team query
    client._teamIdCache = "team-uuid";
    const result = await updateStatus(
      { id: "ENG-9", status: "approved" },
      client
    );

    const issueUpdateCall = calls[4];
    expect(issueUpdateCall.body.query).toContain("IssueUpdate");
    expect(issueUpdateCall.body.variables).toEqual({
      id: "issue-uuid",
      input: { labelIds: ["lbl-md", "lbl-status-new"] },
    });
    expect(parsePayload(result)).toEqual({
      id: "ENG-9",
      status: "approved",
      label: "mdops:status:approved",
      state: "In Progress",
    });
  });
});

describe("mdops_link_artifact", () => {
  it("posts a comment with the constructed URL", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // resolveIssueId
        { issue: { id: "issue-uuid" } },
        // commentCreate
        {
          commentCreate: {
            success: true,
            comment: { id: "c1", createdAt: "t" },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await linkArtifact(
      { id: "ENG-7", artifact_path: "artifacts/sales-requirements.md" },
      client
    );

    expect((calls[1].body.variables as any).input.body).toContain(
      "https://github.com/owner/repo/blob/main/artifacts/sales-requirements.md"
    );
    expect(parsePayload(result).artifactUrl).toContain(
      "artifacts/sales-requirements.md"
    );
  });
});

describe("mdops_assign", () => {
  it("sets first as assignee and rest as subscribers", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        { issue: { id: "issue-uuid" } },
        { users: { nodes: [{ id: "user-alice", name: "Alice", email: "a@x" }] } },
        { users: { nodes: [{ id: "user-bob", name: "Bob", email: "b@x" }] } },
        {
          issueUpdate: {
            success: true,
            issue: {
              id: "issue-uuid",
              identifier: "ENG-4",
              url: "u",
              assignee: { id: "user-alice", name: "Alice" },
              subscribers: { nodes: [{ id: "user-bob", name: "Bob" }] },
            },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await assign(
      { id: "ENG-4", assignees: ["alice@example.com", "bob@example.com"] },
      client
    );

    expect(calls[3].body.variables).toEqual({
      id: "issue-uuid",
      input: { assigneeId: "user-alice", subscriberIds: ["user-bob"] },
    });
    expect(parsePayload(result)).toEqual({
      id: "ENG-4",
      assignee: "Alice",
      subscribers: ["Bob"],
      url: "u",
    });
  });

  it("rejects empty assignees", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(
      assign({ id: "ENG-1", assignees: [] }, client)
    ).rejects.toThrow();
  });
});
