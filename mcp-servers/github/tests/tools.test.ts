import { describe, it, expect, vi } from "vitest";
import type { GithubClient } from "../src/github-client.js";
import { createIssue } from "../src/tools/createIssue.js";
import { getIssue } from "../src/tools/getIssue.js";
import { listIssues } from "../src/tools/listIssues.js";
import { addComment } from "../src/tools/addComment.js";
import { updateStatus } from "../src/tools/updateStatus.js";
import { linkArtifact } from "../src/tools/linkArtifact.js";
import { assign } from "../src/tools/assign.js";
import { tools, dispatch } from "../src/tools/index.js";

function makeClient(overrides: Record<string, unknown> = {}): GithubClient {
  const issues = {
    create: vi.fn(),
    get: vi.fn(),
    listForRepo: vi.fn(),
    createComment: vi.fn(),
    update: vi.fn(),
    addLabels: vi.fn(),
    removeLabel: vi.fn(),
    addAssignees: vi.fn(),
    ...overrides,
  };
  return {
    owner: "acme",
    repo: "demo",
    defaultLabels: ["markdownops"],
    octokit: { issues } as unknown as GithubClient["octokit"],
  };
}

function parsePayload(result: { content: { text: string }[] }) {
  return JSON.parse(result.content[0].text);
}

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
    await expect(dispatch("does_not_exist", {}, client)).rejects.toThrow(
      /Unknown tool/
    );
  });
});

describe("mdops_create_issue", () => {
  it("creates an issue, merges default labels, and returns the standard payload", async () => {
    const create = vi.fn().mockResolvedValue({
      data: {
        number: 42,
        html_url: "https://github.com/acme/demo/issues/42",
        title: "T",
        state: "open",
        labels: [{ name: "markdownops" }, { name: "role:product" }],
        assignees: [{ login: "alice" }],
      },
    });
    const client = makeClient({ create });

    const result = await createIssue(
      { title: "T", body: "B", labels: ["role:product"], assignees: ["alice"] },
      client
    );

    expect(create).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      title: "T",
      body: "B",
      labels: ["markdownops", "role:product"],
      assignees: ["alice"],
    });
    expect(parsePayload(result)).toEqual({
      id: 42,
      url: "https://github.com/acme/demo/issues/42",
      title: "T",
      state: "open",
      labels: ["markdownops", "role:product"],
      assignees: ["alice"],
    });
  });

  it("requires title and body", async () => {
    const client = makeClient();
    await expect(createIssue({ body: "B" }, client)).rejects.toThrow(/title/);
    await expect(createIssue({ title: "T" }, client)).rejects.toThrow(/body/);
  });
});

describe("mdops_get_issue", () => {
  it("returns the issue with status extracted from label", async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        number: 7,
        html_url: "u",
        title: "Hi",
        body: "Body",
        state: "open",
        labels: [{ name: "mdops:status:in-review" }, { name: "markdownops" }],
        assignees: [],
        comments: 0,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
    });
    const client = makeClient({ get });

    const result = await getIssue({ id: 7 }, client);

    expect(get).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 7,
    });
    expect(parsePayload(result).status).toBe("in-review");
  });

  it("rejects non-positive ids", async () => {
    const client = makeClient();
    await expect(getIssue({ id: 0 }, client)).rejects.toThrow();
    await expect(getIssue({ id: -1 }, client)).rejects.toThrow();
  });
});

describe("mdops_list_issues", () => {
  it("filters out PRs, applies status label, and post-filters by query", async () => {
    const listForRepo = vi.fn().mockResolvedValue({
      data: [
        {
          number: 1,
          html_url: "u1",
          title: "Sales req for ACME",
          body: "x",
          state: "open",
          labels: [{ name: "mdops:status:in-review" }],
          assignees: [],
          updated_at: "t",
        },
        {
          number: 2,
          html_url: "u2",
          title: "PRD",
          body: "z",
          state: "open",
          labels: [{ name: "mdops:status:in-review" }],
          assignees: [],
          updated_at: "t",
          pull_request: {},
        },
        {
          number: 3,
          html_url: "u3",
          title: "Other thing",
          body: "z",
          state: "open",
          labels: [{ name: "mdops:status:in-review" }],
          assignees: [],
          updated_at: "t",
        },
      ],
    });
    const client = makeClient({ listForRepo });

    const result = await listIssues(
      { status: "in-review", query: "ACME", limit: 50 },
      client
    );

    expect(listForRepo).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      state: "all",
      per_page: 50,
      labels: "mdops:status:in-review",
      assignee: undefined,
    });
    const items = parsePayload(result);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(1);
    expect(items[0].status).toBe("in-review");
  });
});

describe("mdops_add_comment", () => {
  it("posts the comment and returns metadata", async () => {
    const createComment = vi.fn().mockResolvedValue({
      data: {
        id: 123,
        html_url: "https://x/comment/123",
        created_at: "2026-01-01",
      },
    });
    const client = makeClient({ createComment });

    const result = await addComment({ id: 7, body: "## Review" }, client);

    expect(createComment).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 7,
      body: "## Review",
    });
    expect(parsePayload(result).commentId).toBe(123);
  });
});

describe("mdops_update_status", () => {
  it("removes prior status label, adds the new one, and closes on approved", async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        number: 9,
        state: "open",
        labels: [{ name: "mdops:status:in-review" }, { name: "markdownops" }],
      },
    });
    const removeLabel = vi.fn().mockResolvedValue({});
    const addLabels = vi.fn().mockResolvedValue({});
    const update = vi
      .fn()
      .mockResolvedValue({ data: { state: "closed", number: 9 } });
    const client = makeClient({ get, removeLabel, addLabels, update });

    const result = await updateStatus({ id: 9, status: "approved" }, client);

    expect(removeLabel).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 9,
      name: "mdops:status:in-review",
    });
    expect(addLabels).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 9,
      labels: ["mdops:status:approved"],
    });
    expect(update).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 9,
      state: "closed",
      state_reason: "completed",
    });
    expect(parsePayload(result)).toEqual({
      id: 9,
      status: "approved",
      state: "closed",
      label: "mdops:status:approved",
    });
  });

  it("rejects unknown status values", async () => {
    const client = makeClient();
    await expect(
      updateStatus({ id: 1, status: "shipped" }, client)
    ).rejects.toThrow();
  });
});

describe("mdops_link_artifact", () => {
  it("posts a comment with the constructed URL", async () => {
    const createComment = vi
      .fn()
      .mockResolvedValue({ data: { id: 1, html_url: "u" } });
    const client = makeClient({ createComment });

    const result = await linkArtifact(
      {
        id: 7,
        artifact_path: "artifacts/sales-requirements.md",
        commit: "main",
      },
      client
    );

    const callArg = createComment.mock.calls[0][0];
    expect(callArg.body).toContain(
      "https://github.com/acme/demo/blob/main/artifacts/sales-requirements.md"
    );
    expect(parsePayload(result).artifactUrl).toContain("artifacts/sales-requirements.md");
  });

  it("requires both id and artifact_path", async () => {
    const client = makeClient();
    await expect(
      linkArtifact({ id: 1 }, client)
    ).rejects.toThrow(/artifact_path/);
  });
});

describe("mdops_assign", () => {
  it("calls addAssignees and returns the resulting list", async () => {
    const addAssignees = vi.fn().mockResolvedValue({
      data: {
        html_url: "u",
        assignees: [{ login: "bob" }, { login: "carol" }],
      },
    });
    const client = makeClient({ addAssignees });

    const result = await assign(
      { id: 4, assignees: ["bob", "carol"] },
      client
    );

    expect(addAssignees).toHaveBeenCalledWith({
      owner: "acme",
      repo: "demo",
      issue_number: 4,
      assignees: ["bob", "carol"],
    });
    expect(parsePayload(result).assignees).toEqual(["bob", "carol"]);
  });

  it("rejects empty assignees array", async () => {
    const client = makeClient();
    await expect(assign({ id: 1, assignees: [] }, client)).rejects.toThrow();
  });
});
