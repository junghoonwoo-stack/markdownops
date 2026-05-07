# MarkdownOps MCP server — Asana

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by the Asana REST API.

## Install

```sh
cd mcp-servers/asana
npm install
npm run build
```

## Configure

| Variable | Required | Description |
|---|---|---|
| `ASANA_PAT` | yes | Personal Access Token from `app.asana.com/0/my-apps`. |
| `MDOPS_ASANA_PROJECT` | yes | Project GID (numeric string from project URL). |
| `MDOPS_ASANA_WORKSPACE` | no | Workspace GID. Resolved from the project if unset. |
| `MDOPS_DEFAULT_LABELS` | no | Default tags. Default `markdownops`. Auto-created if missing. |
| `MDOPS_ASANA_ARTIFACT_BASE` | no | Base URL for `mdops_link_artifact` (e.g. a GitHub blob URL). |

## Tools exposed

| Tool | Maps to |
|---|---|
| `mdops_create_issue` | `POST /tasks` |
| `mdops_get_issue` | `GET /tasks/{gid}` |
| `mdops_list_issues` | `GET /projects/{gid}/tasks` |
| `mdops_add_comment` | `POST /tasks/{gid}/stories` |
| `mdops_update_status` | `PUT /tasks/{gid}` swapping the `mdops:status:*` tag |
| `mdops_link_artifact` | story (comment) on the task with a deep link |
| `mdops_assign` | `PUT /tasks/{gid}` setting `assignee` + `followers` |

### Identifiers

`id` is the Asana task GID (numeric string). Pass it as a string from the
caller; the server forwards it to `/tasks/{gid}`.

### Status mapping

MarkdownOps statuses are stored as workspace tags with the `mdops:status:`
prefix — same convention as the GitHub, GitLab, Jira, Linear, and Notion
connectors. Tags are auto-created in the workspace if missing.

### Assignment model

Asana tasks have a single `assignee` plus a `followers` list. `mdops_assign`
sets the first name as the assignee and the rest as followers, after resolving
each via the Asana `/users` endpoint.

## Test

```sh
npm test
```

Unit tests stub `globalThis.fetch`; no Asana credentials needed.

---

## 한국어

# MarkdownOps MCP 서버 — Asana

표준 `mdops_*` 도구군을 Asana REST API로 노출하는 Model Context Protocol 서버.

## 설정

| 변수 | 필수 | 설명 |
|---|---|---|
| `ASANA_PAT` | yes | `app.asana.com/0/my-apps`의 Personal Access Token. |
| `MDOPS_ASANA_PROJECT` | yes | 프로젝트 GID (숫자 문자열). |
| `MDOPS_ASANA_WORKSPACE` | no | 워크스페이스 GID. 미설정 시 프로젝트에서 도출. |
| `MDOPS_DEFAULT_LABELS` | no | 기본 태그. 기본 `markdownops`. 미존재 시 자동 생성. |
| `MDOPS_ASANA_ARTIFACT_BASE` | no | `mdops_link_artifact`용 base URL. |

## 노출 도구

| 도구 | 매핑 |
|---|---|
| `mdops_create_issue` | `POST /tasks` |
| `mdops_get_issue` | `GET /tasks/{gid}` |
| `mdops_list_issues` | `GET /projects/{gid}/tasks` |
| `mdops_add_comment` | `POST /tasks/{gid}/stories` |
| `mdops_update_status` | `PUT /tasks/{gid}`로 `mdops:status:*` 태그 교체 |
| `mdops_link_artifact` | task에 deep link story (코멘트) |
| `mdops_assign` | `PUT /tasks/{gid}` `assignee` + `followers` 설정 |

### 식별자

`id`는 Asana task GID (숫자 문자열).

### 상태 매핑

MarkdownOps 상태는 `mdops:status:` 접두 워크스페이스 태그로 저장 — 다른 커넥터와
동일 컨벤션. 태그가 없으면 자동 생성.

### 할당 모델

Asana task는 단일 `assignee` + `followers` 리스트. `mdops_assign`은 첫 사람을
assignee, 나머지를 followers로 설정. `/users` 엔드포인트로 이름/이메일 → GID
변환.

## 테스트

```sh
npm test
```

단위 테스트는 `globalThis.fetch`를 스텁한다. Asana 자격증명 불필요.
