# Runner — MCP (the protocol layer)

This page explains how MarkdownOps uses the Model Context Protocol so the
[other runners](README.md) can describe their integration in one section.

## What MCP gives MarkdownOps

The protocol-agnostic question MarkdownOps has to answer is: **how does a
running agent get tools to act on the coordination layer?** MCP answers it by
defining a standard for tool servers — programs that:

1. Speak a JSON-RPC protocol over stdio (or SSE).
2. Advertise a list of tools with names, descriptions, and JSON schemas.
3. Execute tool calls and return results.

A runtime (Claude Code, Cursor, Continue, Codex, Gemini CLI) launches the
server, asks for the tool list, exposes those tools to the LLM, and routes
tool calls between them.

## The standard MarkdownOps tool family

Every coordination connector in `mcp-servers/` exposes the same tools. New
connectors implement these and are interchangeable:

| Tool | Purpose | Input |
|---|---|---|
| `mdops_create_issue` | Create a coordination unit | `title`, `body`, `labels?`, `assignees?` |
| `mdops_get_issue` | Read a coordination unit | `id` |
| `mdops_list_issues` | Search / filter | `query?`, `status?`, `assignee?`, `limit?` |
| `mdops_add_comment` | Post a review or decision | `id`, `body` |
| `mdops_update_status` | Transition state | `id`, `status` |
| `mdops_link_artifact` | Attach a Markdown source | `id`, `artifact_path`, `commit?` |
| `mdops_assign` | Set reviewer / owner | `id`, `assignees` |

An agent prompt can refer to any of these by name without knowing which
backend is loaded. Swapping `mcp-servers/github/` for `mcp-servers/jira/`
changes nothing in the prompts.

## Why this matters for adoption

A team adopting MarkdownOps does not need to rewrite agent prompts when they
switch coordination tools. They:

1. Pick a connector that matches their stack (`github`, `gitlab`, `jira`,
   `linear`, ...).
2. Configure its environment variables.
3. Register it with their runtime once.

The agents stay the same. The templates stay the same. Only the connector
binary changes.

## Building a new connector

If your coordination tool is not in `mcp-servers/`:

1. Copy `mcp-servers/github/` as a starting template.
2. Implement each `mdops_*` tool against your tool's API. Map vocabulary:
   - "issue" → your tool's record (Jira issue, Linear issue, Asana task, etc.)
   - "comment" → your tool's comment / activity item
   - "status" → your tool's workflow state
   - "labels" → your tool's tags / fields
3. Keep the tool names exactly as listed above. The `mdops_` prefix is part
   of the contract.
4. Add tests that mock the tool's API and verify the protocol-level behavior.
5. Document the environment variables in the connector's `README.md`.
6. Add the connector to the table in `mcp-servers/README.md`.

## Inspecting an MCP server in isolation

The `@modelcontextprotocol/inspector` tool lets you launch a server and call
its tools directly without an LLM:

```sh
npx @modelcontextprotocol/inspector node mcp-servers/github/dist/index.js
```

Use this to verify a connector before wiring it into a runtime.

---

## 한국어

# 러너 — MCP (프로토콜 레이어)

[다른 러너들](README.md)이 통합 부분을 한 섹션으로 설명할 수 있도록, MarkdownOps가
Model Context Protocol을 어떻게 쓰는지 정리한다.

## MCP가 MarkdownOps에 주는 것

MarkdownOps가 답해야 할 프로토콜-무관 질문: **실행 중인 agent는 어떻게 협업
레이어에서 행동할 도구를 얻는가?** MCP는 도구 서버 표준으로 답한다 — 다음을
하는 프로그램:

1. stdio (또는 SSE) 위에서 JSON-RPC 프로토콜을 말한다.
2. 이름·설명·JSON schema가 붙은 도구 목록을 광고한다.
3. 도구 호출을 실행하고 결과를 반환한다.

runtime (Claude Code, Cursor, Continue, Codex, Gemini CLI)이 서버를 띄우고,
도구 목록을 묻고, 그 도구를 LLM에 노출하며, 도구 호출을 라우팅한다.

## 표준 MarkdownOps 도구 군

`mcp-servers/`의 모든 협업 커넥터는 동일한 도구를 노출. 새 커넥터는 이를 구현하며
서로 교체 가능:

| 도구 | 목적 | 입력 |
|---|---|---|
| `mdops_create_issue` | 협업 단위 생성 | `title`, `body`, `labels?`, `assignees?` |
| `mdops_get_issue` | 협업 단위 읽기 | `id` |
| `mdops_list_issues` | 검색/필터 | `query?`, `status?`, `assignee?`, `limit?` |
| `mdops_add_comment` | 리뷰/결정 게시 | `id`, `body` |
| `mdops_update_status` | 상태 전이 | `id`, `status` |
| `mdops_link_artifact` | Markdown source 첨부 | `id`, `artifact_path`, `commit?` |
| `mdops_assign` | 리뷰어/오너 지정 | `id`, `assignees` |

agent 프롬프트는 어떤 백엔드가 로드되었는지 모르고도 위 이름들로 도구를 참조할
수 있다. `mcp-servers/github/`에서 `mcp-servers/jira/`로 바꿔도 프롬프트는
변하지 않는다.

## 왜 이게 도입에 중요한가

MarkdownOps를 도입하는 팀은 협업 도구를 바꿀 때 agent 프롬프트를 다시 쓸 필요가
없다. 그들은:

1. 자기 스택에 맞는 커넥터를 고른다 (`github`, `gitlab`, `jira`, `linear`, ...).
2. 환경 변수를 설정.
3. runtime에 한 번 등록.

agent는 동일. 템플릿도 동일. 커넥터 바이너리만 바뀐다.

## 새 커넥터 만들기

협업 도구가 `mcp-servers/`에 없다면:

1. `mcp-servers/github/`를 출발점으로 복사.
2. 각 `mdops_*` 도구를 사용 도구 API에 매핑. 어휘 매핑:
   - "issue" → 사용 도구의 레코드 (Jira issue, Linear issue, Asana task 등)
   - "comment" → 사용 도구의 코멘트/활동 항목
   - "status" → 사용 도구의 워크플로우 상태
   - "labels" → 사용 도구의 태그/필드
3. 도구 이름은 위와 정확히 동일하게 유지. `mdops_` 접두는 계약의 일부.
4. 도구 API를 모킹하고 프로토콜 레벨 동작을 검증하는 테스트 추가.
5. 환경 변수를 커넥터 `README.md`에 문서화.
6. 커넥터를 `mcp-servers/README.md`의 표에 추가.

## MCP 서버를 단독 검사

`@modelcontextprotocol/inspector` 도구로 LLM 없이 서버를 띄우고 도구를 직접 호출
가능:

```sh
npx @modelcontextprotocol/inspector node mcp-servers/github/dist/index.js
```

runtime에 결선 전 커넥터 검증에 사용.
