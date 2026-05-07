import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createNotionClient,
  type NotionClient,
} from "../src/notion-client.js";
import { createIssue } from "../src/tools/createIssue.js";
import { getIssue } from "../src/tools/getIssue.js";
import { listIssues } from "../src/tools/listIssues.js";
import { addComment } from "../src/tools/addComment.js";
import { updateStatus } from "../src/tools/updateStatus.js";
import { linkArtifact } from "../src/tools/linkArtifact.js";
import { assign } from "../src/tools/assign.js";
import { tools, dispatch } from "../src/tools/index.js";
import { markdownToBlocks, blocksToMarkdown } from "../src/markdown.js";

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
    if (data === undefined) return new Response(null, { status: 204 });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

function makeClient(overrides: Partial<NotionClient> = {}): NotionClient {
  const c = createNotionClient({
    apiKey: "secret_test",
    databaseId: "db-uuid",
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

describe("markdownToBlocks / blocksToMarkdown", () => {
  it("recognizes headings, bullets, and paragraphs", () => {
    const md = "# Title\n\nIntro paragraph.\n\n## Section\n\n- one\n- two\n\n1. first\n2. second";
    const blocks = markdownToBlocks(md);
    const types = blocks.map((b) => b.type);
    expect(types).toEqual([
      "heading_1",
      "paragraph",
      "heading_2",
      "bulleted_list_item",
      "bulleted_list_item",
      "numbered_list_item",
      "numbered_list_item",
    ]);
  });

  it("round-trips back to markdown for the recognized subset", () => {
    const md = "# Title\n\n- one\n- two";
    const out = blocksToMarkdown(markdownToBlocks(md));
    expect(out).toContain("# Title");
    expect(out).toContain("- one");
    expect(out).toContain("- two");
  });
});

describe("mdops_create_issue", () => {
  it("resolves assignees, then creates a page with body blocks", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // /users
        {
          results: [
            { id: "user-alice", name: "Alice", person: { email: "alice@example.com" } },
          ],
        },
        // POST /pages
        {
          id: "page-uuid",
          url: "https://notion.so/page-uuid",
          created_time: "t",
          last_edited_time: "t",
          properties: {
            Name: {
              type: "title",
              title: [{ type: "text", text: { content: "T" }, plain_text: "T" }],
            },
            Tags: {
              type: "multi_select",
              multi_select: [{ name: "markdownops" }, { name: "role:product" }],
            },
            Assignees: {
              type: "people",
              people: [{ id: "user-alice", name: "Alice" }],
            },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await createIssue(
      { title: "T", body: "# Heading\n\nBody.", labels: ["role:product"], assignees: ["alice@example.com"] },
      client
    );

    expect(calls[0].url).toContain("/v1/users");
    expect(calls[0].headers.Authorization).toBe("Bearer secret_test");
    expect(calls[0].headers["Notion-Version"]).toBe("2022-06-28");

    expect(calls[1].url).toContain("/v1/pages");
    expect(calls[1].method).toBe("POST");
    const sent = calls[1].body as Record<string, any>;
    expect(sent.parent).toEqual({ database_id: "db-uuid" });
    expect(sent.properties.Name.title[0].text.content).toBe("T");
    expect(sent.properties.Tags.multi_select).toEqual([
      { name: "markdownops" },
      { name: "role:product" },
    ]);
    expect(sent.properties.Assignees.people).toEqual([{ id: "user-alice" }]);
    expect(sent.children).toHaveLength(2);
    expect(sent.children[0].type).toBe("heading_1");

    expect(parsePayload(result)).toMatchObject({
      id: "page-uuid",
      url: "https://notion.so/page-uuid",
      title: "T",
      labels: ["markdownops", "role:product"],
      assignees: ["Alice"],
    });
  });
});

describe("mdops_get_issue", () => {
  it("reads page + blocks and reconstructs status from Tags", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          id: "page-uuid",
          url: "u",
          created_time: "c",
          last_edited_time: "u2",
          properties: {
            Name: {
              type: "title",
              title: [{ type: "text", text: { content: "Title" }, plain_text: "Title" }],
            },
            Tags: {
              type: "multi_select",
              multi_select: [
                { name: "mdops:status:in-review" },
                { name: "markdownops" },
              ],
            },
            Assignees: {
              type: "people",
              people: [{ id: "user-alice", name: "Alice" }],
            },
          },
        },
        {
          results: [
            { type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "Hi" }, plain_text: "Hi" }] } },
            { type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Body." }, plain_text: "Body." }] } },
          ],
        },
      ])
    );

    const client = makeClient();
    const result = await getIssue({ id: "page-uuid" }, client);

    expect(calls[0].url).toContain("/v1/pages/page-uuid");
    expect(calls[1].url).toContain("/v1/blocks/page-uuid/children");

    const payload = parsePayload(result);
    expect(payload.title).toBe("Title");
    expect(payload.status).toBe("in-review");
    expect(payload.assignees).toEqual(["Alice"]);
    expect(payload.body).toContain("# Hi");
    expect(payload.body).toContain("Body.");
  });
});

describe("mdops_list_issues", () => {
  it("queries the database with combined AND filters", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          results: [
            {
              id: "page-1",
              url: "u1",
              created_time: "c",
              last_edited_time: "u",
              properties: {
                Name: {
                  type: "title",
                  title: [{ type: "text", text: { content: "Sales req for ACME" }, plain_text: "Sales req for ACME" }],
                },
                Tags: {
                  type: "multi_select",
                  multi_select: [{ name: "mdops:status:in-review" }],
                },
                Assignees: {
                  type: "people",
                  people: [{ id: "user-alice", name: "Alice" }],
                },
              },
            },
          ],
        },
      ])
    );

    const client = makeClient();
    const result = await listIssues(
      { status: "in-review", query: "ACME", limit: 50 },
      client
    );

    expect(calls[0].url).toContain("/v1/databases/db-uuid/query");
    expect(calls[0].method).toBe("POST");
    const sent = calls[0].body as any;
    expect(sent.page_size).toBe(50);
    expect(sent.filter.and).toEqual([
      { property: "Tags", multi_select: { contains: "mdops:status:in-review" } },
      { property: "Name", title: { contains: "ACME" } },
    ]);

    const items = parsePayload(result);
    expect(items[0].id).toBe("page-1");
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("posts a comment", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        { id: "comment-1", created_time: "t" },
      ])
    );

    const client = makeClient();
    const result = await addComment({ id: "page-uuid", body: "## Review" }, client);

    expect(calls[0].url).toContain("/v1/comments");
    expect(calls[0].method).toBe("POST");
    expect((calls[0].body as any).parent).toEqual({ page_id: "page-uuid" });
    expect((calls[0].body as any).rich_text[0].text.content).toBe("## Review");
    expect(parsePayload(result).commentId).toBe("comment-1");
  });
});

describe("mdops_update_status", () => {
  it("replaces prior status tag, keeps other tags", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        // GET current page
        {
          id: "page-uuid",
          url: "u",
          created_time: "c",
          last_edited_time: "u",
          properties: {
            Tags: {
              type: "multi_select",
              multi_select: [
                { name: "mdops:status:in-review" },
                { name: "markdownops" },
              ],
            },
          },
        },
        // PATCH
        {
          id: "page-uuid",
          properties: {
            Tags: {
              type: "multi_select",
              multi_select: [
                { name: "markdownops" },
                { name: "mdops:status:approved" },
              ],
            },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await updateStatus(
      { id: "page-uuid", status: "approved" },
      client
    );

    expect(calls[1].method).toBe("PATCH");
    const sent = calls[1].body as any;
    expect(sent.properties.Tags.multi_select).toEqual([
      { name: "markdownops" },
      { name: "mdops:status:approved" },
    ]);
    expect(parsePayload(result)).toEqual({
      id: "page-uuid",
      status: "approved",
      label: "mdops:status:approved",
      state: "active",
    });
  });
});

describe("mdops_link_artifact", () => {
  it("posts a comment with a constructed URL when base is set", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: "c1", created_time: "t" }])
    );

    const client = makeClient();
    const result = await linkArtifact(
      { id: "page-uuid", artifact_path: "artifacts/sales-requirements.md" },
      client
    );

    const sent = calls[0].body as any;
    expect(sent.parent).toEqual({ page_id: "page-uuid" });
    const linkSegment = sent.rich_text.find((t: any) => t.text?.link?.url);
    expect(linkSegment.text.link.url).toContain(
      "https://github.com/owner/repo/blob/main/artifacts/sales-requirements.md"
    );
    expect(parsePayload(result).artifactUrl).toContain("artifacts/sales-requirements.md");
  });

  it("falls back to plain text when no base is configured", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([{ id: "c1", created_time: "t" }])
    );

    const client = makeClient({ artifactBase: "" });
    const result = await linkArtifact(
      { id: "page-uuid", artifact_path: "artifacts/x.md" },
      client
    );

    expect(parsePayload(result).artifactUrl).toBeNull();
  });
});

describe("mdops_assign", () => {
  it("resolves users and patches Assignees", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchMock([
        {
          results: [
            { id: "user-alice", name: "Alice", person: { email: "alice@example.com" } },
            { id: "user-bob", name: "Bob", person: { email: "bob@example.com" } },
          ],
        },
        {
          id: "page-uuid",
          url: "u",
          created_time: "c",
          last_edited_time: "u",
          properties: {
            Assignees: {
              type: "people",
              people: [
                { id: "user-alice", name: "Alice" },
                { id: "user-bob", name: "Bob" },
              ],
            },
          },
        },
      ])
    );

    const client = makeClient();
    const result = await assign(
      { id: "page-uuid", assignees: ["alice@example.com", "Bob"] },
      client
    );

    expect(calls[1].method).toBe("PATCH");
    expect((calls[1].body as any).properties.Assignees.people).toEqual([
      { id: "user-alice" },
      { id: "user-bob" },
    ]);
    expect(parsePayload(result).assignees).toEqual(["Alice", "Bob"]);
  });

  it("rejects empty assignees", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const client = makeClient();
    await expect(
      assign({ id: "page-uuid", assignees: [] }, client)
    ).rejects.toThrow();
  });
});
