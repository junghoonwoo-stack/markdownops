# MarkdownOps MCP server — GitLab Issues

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by GitLab Issues. Works for both gitlab.com and self-hosted GitLab.

## Install

```sh
cd mcp-servers/gitlab
npm install
npm run build
```

## Configure

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `GITLAB_TOKEN` | yes | Personal access token with `api` scope. |
| `MDOPS_GITLAB_PROJECT` | yes | Project ID (numeric) or path (`namespace/repo`, will be URL-encoded). |
| `MDOPS_GITLAB_HOST` | no | GitLab host URL. Defaults to `https://gitlab.com`. Set for self-hosted instances. |
| `MDOPS_DEFAULT_LABELS` | no | Comma-separated labels added to every new issue. Defaults to `markdownops`. |

## Run

```sh
npm start
```

The server speaks MCP over stdio. Inspect interactively without an LLM:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

## Wire into a runtime

See the per-runtime guides under [../../runners/](../../runners/). Configuration
snippet:

```jsonc
{
  "mcpServers": {
    "markdownops-gitlab": {
      "command": "node",
      "args": ["/absolute/path/to/markdownops/mcp-servers/gitlab/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "<your-token>",
        "MDOPS_GITLAB_PROJECT": "namespace/repo",
        "MDOPS_GITLAB_HOST": "https://gitlab.com"
      }
    }
  }
}
```

## Tools exposed

| Tool | Maps to |
|---|---|
| `mdops_create_issue` | `POST /projects/:id/issues` |
| `mdops_get_issue` | `GET /projects/:id/issues/:iid` |
| `mdops_list_issues` | `GET /projects/:id/issues` (with state, labels, search filters) |
| `mdops_add_comment` | `POST /projects/:id/issues/:iid/notes` |
| `mdops_update_status` | label transition via `PUT` `add_labels` / `remove_labels`; closes when `approved` |
| `mdops_link_artifact` | comment with a deep link to the file in the project |
| `mdops_assign` | resolves usernames → user IDs, then `PUT` `assignee_ids` |

### Status mapping

GitLab Issues do not carry a generic status field, so MarkdownOps statuses are
stored as labels with the `mdops:status:` prefix (single colon — same convention
as the GitHub connector for cross-tool consistency):

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

Calling `mdops_update_status` removes any prior `mdops:status:*` label and adds
the new one. When the new status is `approved`, the issue is also closed via
`state_event=close`.

### Identifiers

The `id` parameter for issue tools is GitLab's `iid` (the per-project number,
e.g. `42` for `#42`), not the global `id`. This matches what users see in URLs.

## Test

```sh
npm test
```

Unit tests stub `globalThis.fetch`; no GitLab credentials needed.

---

## 한국어

# MarkdownOps MCP 서버 — GitLab Issues

표준 `mdops_*` 도구군을 GitLab Issues 백엔드로 노출하는 Model Context Protocol
서버. gitlab.com과 self-hosted GitLab 모두 동작.

## 설치

```sh
cd mcp-servers/gitlab
npm install
npm run build
```

## 설정

`.env.example`를 `.env`로 복사하고 채운다:

| 변수 | 필수 | 설명 |
|---|---|---|
| `GITLAB_TOKEN` | yes | `api` 스코프의 personal access token. |
| `MDOPS_GITLAB_PROJECT` | yes | 프로젝트 ID(숫자) 또는 경로 (`namespace/repo`. URL 인코딩됨). |
| `MDOPS_GITLAB_HOST` | no | GitLab 호스트 URL. 기본 `https://gitlab.com`. self-hosted는 인스턴스 지정. |
| `MDOPS_DEFAULT_LABELS` | no | 새 이슈에 자동 부여할 라벨 (쉼표 구분). 기본 `markdownops`. |

## 실행

```sh
npm start
```

서버는 stdio 위에서 MCP를 말한다. LLM 없이 대화식 검사:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

## runtime에 연결

[../../runners/](../../runners/) 참조. 설정 스니펫:

```jsonc
{
  "mcpServers": {
    "markdownops-gitlab": {
      "command": "node",
      "args": ["/absolute/path/to/markdownops/mcp-servers/gitlab/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "<your-token>",
        "MDOPS_GITLAB_PROJECT": "namespace/repo",
        "MDOPS_GITLAB_HOST": "https://gitlab.com"
      }
    }
  }
}
```

## 노출 도구

| 도구 | 매핑 |
|---|---|
| `mdops_create_issue` | `POST /projects/:id/issues` |
| `mdops_get_issue` | `GET /projects/:id/issues/:iid` |
| `mdops_list_issues` | `GET /projects/:id/issues` (state, labels, search 필터) |
| `mdops_add_comment` | `POST /projects/:id/issues/:iid/notes` |
| `mdops_update_status` | `PUT`의 `add_labels`/`remove_labels`로 라벨 전이; `approved`이면 close |
| `mdops_link_artifact` | 프로젝트 내 파일에 대한 deep link 코멘트 |
| `mdops_assign` | username → user ID 변환 후 `PUT`의 `assignee_ids` |

### 상태 매핑

GitLab Issue에는 일반 status 필드가 없으므로, MarkdownOps 상태는 `mdops:status:`
접두 라벨로 저장 (싱글 콜론 — GitHub 커넥터와 동일 컨벤션, cross-tool 일관성):

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status` 호출은 기존 `mdops:status:*` 라벨을 제거하고 새 라벨을
부착한다. 새 상태가 `approved`이면 `state_event=close`로 이슈도 close된다.

### 식별자

이슈 도구의 `id` 파라미터는 GitLab의 `iid` (프로젝트별 번호 — 예: `#42`라면 `42`)
이지 글로벌 `id`가 아니다. 사용자가 URL에서 보는 값과 일치.

## 테스트

```sh
npm test
```

단위 테스트는 `globalThis.fetch`를 스텁한다. GitLab 자격증명 불필요.
