# MarkdownOps MCP server — Jira Cloud

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by Jira Cloud's REST API v2.

## Install

```sh
cd mcp-servers/jira
npm install
npm run build
```

## Configure

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `JIRA_EMAIL` | yes | Atlassian account email associated with the API token. |
| `JIRA_API_TOKEN` | yes | API token from id.atlassian.com/manage-profile/security/api-tokens. |
| `MDOPS_JIRA_HOST` | yes | Jira Cloud host URL (e.g. `https://yourcompany.atlassian.net`). |
| `MDOPS_JIRA_PROJECT` | yes | Project key (e.g. `PROJ`). |
| `MDOPS_JIRA_ISSUE_TYPE` | no | Issue type for new issues. Default `Task`. |
| `MDOPS_DEFAULT_LABELS` | no | Default labels on new issues. Default `markdownops`. |
| `MDOPS_JIRA_ARTIFACT_BASE` | no | Base URL for `mdops_link_artifact` (e.g. a GitHub blob URL). If unset, the relative path is included verbatim. |

## Run

```sh
npm start
```

Inspect interactively:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

## Tools exposed

| Tool | Maps to |
|---|---|
| `mdops_create_issue` | `POST /rest/api/2/issue` |
| `mdops_get_issue` | `GET /rest/api/2/issue/{idOrKey}` |
| `mdops_list_issues` | `GET /rest/api/2/search` (JQL) |
| `mdops_add_comment` | `POST /rest/api/2/issue/{key}/comment` |
| `mdops_update_status` | label transition via `PUT /issue/{key}` `update.labels` |
| `mdops_link_artifact` | comment with a deep link constructed from `MDOPS_JIRA_ARTIFACT_BASE` |
| `mdops_assign` | resolves emails/names → accountId; first becomes assignee, rest become watchers |

### Identifiers

The `id` parameter accepts either:

- an integer-like Jira issue ID (e.g. `10001`)
- an issue key string (e.g. `PROJ-123`) — pass it as a string in the call

Both forms are routed to the Jira REST endpoint `/issue/{idOrKey}`.

### Status mapping

Jira projects already have workflow statuses (e.g. To Do / In Progress / Done),
which vary per project. To stay portable, MarkdownOps statuses are stored as
labels with the `mdops:status:` prefix — the same convention as the GitHub and
GitLab connectors:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status` removes any prior `mdops:status:*` label and adds the new
one. The Jira workflow status is **not** changed automatically — keep your team's
existing workflow as-is. If you want approved MarkdownOps issues to also
transition to Done, add a Jira automation rule that listens for the
`mdops:status:approved` label.

### Assignment model

Jira issues have a single assignee field plus a watchers list. When
`mdops_assign` receives multiple names, the first becomes the issue's `assignee`
and the rest are added as watchers.

## Test

```sh
npm test
```

Unit tests stub `globalThis.fetch`; no Jira credentials needed.

---

## 한국어

# MarkdownOps MCP 서버 — Jira Cloud

표준 `mdops_*` 도구군을 Jira Cloud REST API v2로 노출하는 Model Context Protocol
서버.

## 설치

```sh
cd mcp-servers/jira
npm install
npm run build
```

## 설정

`.env.example`를 `.env`로 복사 후 채운다:

| 변수 | 필수 | 설명 |
|---|---|---|
| `JIRA_EMAIL` | yes | API 토큰과 연결된 Atlassian 이메일. |
| `JIRA_API_TOKEN` | yes | id.atlassian.com 에서 발급한 API 토큰. |
| `MDOPS_JIRA_HOST` | yes | Jira Cloud 호스트 URL (예: `https://회사.atlassian.net`). |
| `MDOPS_JIRA_PROJECT` | yes | 프로젝트 키 (예: `PROJ`). |
| `MDOPS_JIRA_ISSUE_TYPE` | no | 새 이슈의 issue type. 기본 `Task`. |
| `MDOPS_DEFAULT_LABELS` | no | 새 이슈의 기본 라벨. 기본 `markdownops`. |
| `MDOPS_JIRA_ARTIFACT_BASE` | no | `mdops_link_artifact`가 사용할 base URL (예: GitHub blob). 미설정 시 상대 경로만 포함. |

## 실행

```sh
npm start
```

대화식 검사:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

## 노출 도구

| 도구 | 매핑 |
|---|---|
| `mdops_create_issue` | `POST /rest/api/2/issue` |
| `mdops_get_issue` | `GET /rest/api/2/issue/{idOrKey}` |
| `mdops_list_issues` | `GET /rest/api/2/search` (JQL) |
| `mdops_add_comment` | `POST /rest/api/2/issue/{key}/comment` |
| `mdops_update_status` | `PUT /issue/{key}`의 `update.labels`로 라벨 전이 |
| `mdops_link_artifact` | `MDOPS_JIRA_ARTIFACT_BASE`로 deep link 코멘트 |
| `mdops_assign` | 이메일/이름 → accountId 변환. 첫 사람은 assignee, 나머지는 watchers |

### 식별자

`id` 파라미터는 둘 다 허용:

- Jira 이슈 ID 정수 (예: `10001`)
- 이슈 키 문자열 (예: `PROJ-123`) — 문자열로 전달

### 상태 매핑

Jira 프로젝트는 자체 워크플로우 상태(To Do / In Progress / Done 등)를 갖고 있고
프로젝트마다 다르다. 이식성을 위해 MarkdownOps 상태는 `mdops:status:` 접두 라벨로
저장 — GitHub·GitLab 커넥터와 동일 컨벤션:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status`는 기존 `mdops:status:*` 라벨을 제거하고 새 라벨을 부착한다.
Jira 워크플로우 상태는 자동으로 변경되지 **않는다** — 팀 기존 워크플로우를 그대로
유지. MarkdownOps 승인 시 Jira 상태도 Done으로 옮기고 싶다면 `mdops:status:approved`
라벨을 listen하는 Jira automation 규칙을 추가.

### 할당 모델

Jira 이슈는 단일 assignee 필드 + watchers 리스트를 갖는다. `mdops_assign`이 여러
사람을 받으면 첫 사람은 `assignee`가 되고 나머지는 watchers로 추가된다.

## 테스트

```sh
npm test
```

단위 테스트는 `globalThis.fetch`를 스텁한다. Jira 자격증명 불필요.
