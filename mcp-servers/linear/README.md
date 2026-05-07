# MarkdownOps MCP server — Linear

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by Linear's GraphQL API.

## Install

```sh
cd mcp-servers/linear
npm install
npm run build
```

## Configure

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `LINEAR_API_KEY` | yes | Personal API key from `linear.app/settings/api/personal`. |
| `MDOPS_LINEAR_TEAM` | yes | Team key (e.g. `ENG`) or UUID. |
| `MDOPS_DEFAULT_LABELS` | no | Default labels on new issues. Default `markdownops`. Labels are auto-created in the team if missing. |
| `MDOPS_LINEAR_ARTIFACT_BASE` | no | Base URL used by `mdops_link_artifact` to construct deep links to artifact files. |

## Tools exposed

| Tool | GraphQL operation |
|---|---|
| `mdops_create_issue` | `issueCreate` |
| `mdops_get_issue` | `issue(id)` (accepts identifier like `ENG-123` or UUID) |
| `mdops_list_issues` | `issues(filter, first)` |
| `mdops_add_comment` | `commentCreate` |
| `mdops_update_status` | `issueUpdate` (replaces label set, removing prior `mdops:status:*`) |
| `mdops_link_artifact` | `commentCreate` (link constructed from `MDOPS_LINEAR_ARTIFACT_BASE`) |
| `mdops_assign` | `issueUpdate` (`assigneeId` for first; rest become `subscriberIds`) |

### Identifiers

The `id` parameter accepts Linear identifiers (`TEAM-NUM`, e.g. `ENG-42`) or
UUIDs. Internally the server resolves identifiers to UUIDs as needed.

### Status mapping

Linear has its own workflow states (Backlog / Todo / In Progress / Done /
Canceled). To stay portable across coordination tools, MarkdownOps statuses are
stored as labels with the `mdops:status:` prefix:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status` removes any prior `mdops:status:*` label and adds the new
one. Linear's workflow state is **not** changed automatically; configure a
Linear automation if you want approved MarkdownOps issues to also move to Done.

### Assignment model

Linear issues have a single `assignee` plus a list of `subscribers`. When
`mdops_assign` receives multiple names, the first becomes the issue's assignee
and the rest are added as subscribers.

## Test

```sh
npm test
```

Unit tests stub `globalThis.fetch`; no Linear credentials needed.

---

## 한국어

# MarkdownOps MCP 서버 — Linear

표준 `mdops_*` 도구군을 Linear GraphQL API로 노출하는 Model Context Protocol 서버.

## 설치

```sh
cd mcp-servers/linear
npm install
npm run build
```

## 설정

`.env.example`를 `.env`로 복사 후 채운다:

| 변수 | 필수 | 설명 |
|---|---|---|
| `LINEAR_API_KEY` | yes | `linear.app/settings/api/personal` 에서 발급한 personal API key. |
| `MDOPS_LINEAR_TEAM` | yes | 팀 키 (예: `ENG`) 또는 UUID. |
| `MDOPS_DEFAULT_LABELS` | no | 새 이슈의 기본 라벨. 기본 `markdownops`. 미존재 시 팀에 자동 생성. |
| `MDOPS_LINEAR_ARTIFACT_BASE` | no | `mdops_link_artifact`가 deep link 구성에 쓰는 base URL. |

## 노출 도구

| 도구 | GraphQL 연산 |
|---|---|
| `mdops_create_issue` | `issueCreate` |
| `mdops_get_issue` | `issue(id)` (identifier `ENG-123` 또는 UUID 모두 허용) |
| `mdops_list_issues` | `issues(filter, first)` |
| `mdops_add_comment` | `commentCreate` |
| `mdops_update_status` | `issueUpdate` (이전 `mdops:status:*` 제거 후 새 라벨 추가) |
| `mdops_link_artifact` | `commentCreate` (`MDOPS_LINEAR_ARTIFACT_BASE`로 링크 구성) |
| `mdops_assign` | `issueUpdate` (첫 사람은 `assigneeId`, 나머지는 `subscriberIds`) |

### 식별자

`id` 파라미터는 Linear identifier(`TEAM-NUM`, 예: `ENG-42`) 또는 UUID를 허용.
서버 내부에서 필요 시 UUID로 변환.

### 상태 매핑

Linear는 자체 워크플로우 상태(Backlog/Todo/In Progress/Done/Canceled)를 갖는다.
도구 간 이식성을 위해 MarkdownOps 상태는 `mdops:status:` 접두 라벨로 저장:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status`는 기존 `mdops:status:*` 라벨을 제거하고 새 라벨을 부착.
Linear 워크플로우 상태는 자동 변경되지 **않는다**. 승인 시 Done으로도 이동시키려면
Linear automation을 추가.

### 할당 모델

Linear 이슈는 단일 `assignee` + `subscribers` 리스트를 갖는다. `mdops_assign`이
여러 사람을 받으면 첫 사람은 assignee, 나머지는 subscribers.

## 테스트

```sh
npm test
```

단위 테스트는 `globalThis.fetch`를 스텁한다. Linear 자격증명 불필요.
