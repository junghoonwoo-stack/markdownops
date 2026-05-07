# MarkdownOps MCP server — Notion

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by a Notion database.

## Required database schema

Create a Notion database with these three properties (other properties may
coexist; they are ignored):

| Property | Type |
|---|---|
| `Name` | Title |
| `Tags` | Multi-select |
| `Assignees` | People |

Share the database with your Notion integration so the API token can read and
write it.

## Install

```sh
cd mcp-servers/notion
npm install
npm run build
```

## Configure

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|---|---|---|
| `NOTION_API_KEY` | yes | Integration token from `notion.so/my-integrations`. |
| `MDOPS_NOTION_DATABASE` | yes | Database ID (UUID, with or without dashes). |
| `MDOPS_DEFAULT_LABELS` | no | Default tags. Default `markdownops`. |
| `MDOPS_NOTION_ARTIFACT_BASE` | no | Base URL for `mdops_link_artifact`. |

## Tools exposed

| Tool | Maps to |
|---|---|
| `mdops_create_issue` | `POST /pages` (parent: database) with body rendered into block children |
| `mdops_get_issue` | `GET /pages/{id}` + `GET /blocks/{id}/children` |
| `mdops_list_issues` | `POST /databases/{id}/query` |
| `mdops_add_comment` | `POST /comments` (parent: page) |
| `mdops_update_status` | `PATCH /pages/{id}` updating Tags multi-select |
| `mdops_link_artifact` | comment on page with deep link |
| `mdops_assign` | `PATCH /pages/{id}` updating the Assignees people property |

### Body conversion

The body argument is converted to Notion blocks using a small parser:

- `# heading` → `heading_1`
- `## heading` → `heading_2`
- `### heading` → `heading_3`
- `- item` → `bulleted_list_item`
- `1. item` → `numbered_list_item`
- everything else → `paragraph`

Reading reverses the same mapping. Tables and fenced code blocks become
paragraph blocks in v1; the artifact remains intact in the linked Markdown
source — only the Notion preview is simplified.

### Status mapping

MarkdownOps statuses are stored as `Tags` multi-select values with the
`mdops:status:` prefix, the same convention as the GitHub, GitLab, Jira, and
Linear connectors:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

### Identifiers

The `id` parameter accepts a Notion page UUID, with or without hyphens.

## Test

```sh
npm test
```

Unit tests stub `globalThis.fetch`; no Notion credentials needed.

---

## 한국어

# MarkdownOps MCP 서버 — Notion

표준 `mdops_*` 도구군을 Notion 데이터베이스로 노출하는 Model Context Protocol 서버.

## 필요한 DB 스키마

다음 세 속성을 가진 Notion 데이터베이스를 만든다 (다른 속성이 있어도 무방, 무시됨):

| 속성 | 타입 |
|---|---|
| `Name` | Title |
| `Tags` | Multi-select |
| `Assignees` | People |

API 토큰이 읽기/쓰기 가능하도록 데이터베이스를 integration과 공유한다.

## 설치

```sh
cd mcp-servers/notion
npm install
npm run build
```

## 설정

| 변수 | 필수 | 설명 |
|---|---|---|
| `NOTION_API_KEY` | yes | `notion.so/my-integrations`의 integration 토큰. |
| `MDOPS_NOTION_DATABASE` | yes | 데이터베이스 ID (UUID, 하이픈 유무 무관). |
| `MDOPS_DEFAULT_LABELS` | no | 기본 태그. 기본 `markdownops`. |
| `MDOPS_NOTION_ARTIFACT_BASE` | no | `mdops_link_artifact`용 base URL. |

## 노출 도구

| 도구 | 매핑 |
|---|---|
| `mdops_create_issue` | `POST /pages` (parent: database), body는 블록 children으로 렌더 |
| `mdops_get_issue` | `GET /pages/{id}` + `GET /blocks/{id}/children` |
| `mdops_list_issues` | `POST /databases/{id}/query` |
| `mdops_add_comment` | `POST /comments` (parent: page) |
| `mdops_update_status` | `PATCH /pages/{id}`로 Tags multi-select 갱신 |
| `mdops_link_artifact` | 페이지에 deep link 코멘트 |
| `mdops_assign` | `PATCH /pages/{id}`로 Assignees people 속성 갱신 |

### 본문 변환

body 인자는 작은 파서로 Notion 블록으로 변환:

- `# 제목` → `heading_1`
- `## 제목` → `heading_2`
- `### 제목` → `heading_3`
- `- 항목` → `bulleted_list_item`
- `1. 항목` → `numbered_list_item`
- 나머지 → `paragraph`

읽기는 역방향 매핑. v1에서 표와 fenced code 블록은 paragraph로 변환된다. 원본
Markdown source는 그대로 보존되니 — Notion 프리뷰만 단순화될 뿐.

### 상태 매핑

MarkdownOps 상태는 `Tags` multi-select 값에 `mdops:status:` 접두로 저장. GitHub,
GitLab, Jira, Linear 커넥터와 동일 컨벤션:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

### 식별자

`id` 파라미터는 Notion 페이지 UUID. 하이픈 유무 무관.

## 테스트

```sh
npm test
```

단위 테스트는 `globalThis.fetch`를 스텁한다. Notion 자격증명 불필요.
