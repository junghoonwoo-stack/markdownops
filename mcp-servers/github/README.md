# MarkdownOps MCP server — GitHub Issues

A Model Context Protocol server that exposes the standard `mdops_*` tool family
backed by GitHub Issues. Drop it into any MCP-aware runtime (Claude Code,
Cursor, Continue, Codex, Gemini CLI) and the MarkdownOps agents can route
artifacts through GitHub.

## Install

```sh
cd mcp-servers/github
npm install
npm run build
```

## Configure

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | yes | Personal access token with `repo` (or `public_repo`) scope, plus issues read/write for fine-grained tokens. |
| `MDOPS_GITHUB_REPO` | yes | Target repository in `owner/repo` form. |
| `MDOPS_DEFAULT_LABELS` | no | Comma-separated labels added to every new issue. Defaults to `markdownops`. |

## Run

```sh
npm start
```

The server speaks MCP over stdio. To inspect interactively without an LLM:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

## Wire into a runtime

See the per-runtime guides under [../../runners/](../../runners/). The
configuration snippet for most runtimes is:

```jsonc
{
  "mcpServers": {
    "markdownops-github": {
      "command": "node",
      "args": ["/absolute/path/to/markdownops/mcp-servers/github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "<your-token>",
        "MDOPS_GITHUB_REPO": "owner/repo"
      }
    }
  }
}
```

## Tools exposed

| Tool | Maps to |
|---|---|
| `mdops_create_issue` | `POST /repos/{owner}/{repo}/issues` |
| `mdops_get_issue` | `GET /repos/{owner}/{repo}/issues/{number}` |
| `mdops_list_issues` | `GET /repos/{owner}/{repo}/issues` (with filters) |
| `mdops_add_comment` | `POST /repos/{owner}/{repo}/issues/{number}/comments` |
| `mdops_update_status` | label-based: `mdops:status:<status>` (closes issue when `approved`) |
| `mdops_link_artifact` | comment with a link to the artifact in the repo |
| `mdops_assign` | `POST /repos/{owner}/{repo}/issues/{number}/assignees` |

### Status mapping

GitHub Issues do not carry a generic status field, so MarkdownOps statuses are
stored as labels with the `mdops:status:` prefix:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

Calling `mdops_update_status` removes any prior `mdops:status:*` label and adds
the new one. When the new status is `approved`, the issue is also closed.

## Test

```sh
npm test
```

Unit tests mock Octokit; no GitHub credentials needed.

## Build a different connector from this template

```sh
cp -r mcp-servers/github mcp-servers/<your-tool>
cd mcp-servers/<your-tool>
# 1. Update package.json name / description.
# 2. Replace src/github-client.ts with your tool's SDK wrapper.
# 3. Reimplement each src/tools/*.ts against your tool's API.
# 4. Update tests/.
# 5. Update this README.
```

The standard `mdops_*` interface is enforced by `src/tools/index.ts`. Keep tool
names and input schemas identical; only the implementations change.

---

## 한국어

# MarkdownOps MCP 서버 — GitHub Issues

표준 `mdops_*` 도구군을 GitHub Issues 백엔드로 노출하는 Model Context Protocol
서버. MCP-인지 runtime (Claude Code, Cursor, Continue, Codex, Gemini CLI)에
연결하면 MarkdownOps agent가 산출물을 GitHub로 라우팅한다.

## 설치

```sh
cd mcp-servers/github
npm install
npm run build
```

## 설정

`.env.example`를 `.env`로 복사하고 채운다:

| 변수 | 필수 | 설명 |
|---|---|---|
| `GITHUB_TOKEN` | yes | `repo` (또는 `public_repo`) 스코프의 PAT. fine-grained 토큰의 경우 issues read/write. |
| `MDOPS_GITHUB_REPO` | yes | 대상 리포 — `owner/repo` 형식. |
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

[../../runners/](../../runners/) 아래 runtime별 가이드 참조. 대부분의 runtime에서
설정 스니펫은:

```jsonc
{
  "mcpServers": {
    "markdownops-github": {
      "command": "node",
      "args": ["/absolute/path/to/markdownops/mcp-servers/github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "<your-token>",
        "MDOPS_GITHUB_REPO": "owner/repo"
      }
    }
  }
}
```

## 노출 도구

| 도구 | 매핑 |
|---|---|
| `mdops_create_issue` | `POST /repos/{owner}/{repo}/issues` |
| `mdops_get_issue` | `GET /repos/{owner}/{repo}/issues/{number}` |
| `mdops_list_issues` | `GET /repos/{owner}/{repo}/issues` (필터 적용) |
| `mdops_add_comment` | `POST /repos/{owner}/{repo}/issues/{number}/comments` |
| `mdops_update_status` | 라벨 기반: `mdops:status:<status>` (`approved`이면 이슈 close) |
| `mdops_link_artifact` | 산출물 링크가 포함된 코멘트 게시 |
| `mdops_assign` | `POST /repos/{owner}/{repo}/issues/{number}/assignees` |

### 상태 매핑

GitHub Issue에는 일반 status 필드가 없으므로, MarkdownOps 상태는 `mdops:status:`
접두 라벨로 저장:

- `mdops:status:draft`
- `mdops:status:in-review`
- `mdops:status:approved`
- `mdops:status:changes-requested`
- `mdops:status:blocked`

`mdops_update_status` 호출은 기존 `mdops:status:*` 라벨을 제거하고 새 라벨을
부착한다. 새 상태가 `approved`이면 이슈도 close된다.

## 테스트

```sh
npm test
```

단위 테스트는 Octokit을 모킹한다. GitHub 자격 증명 불필요.

## 이 템플릿으로 다른 커넥터 만들기

```sh
cp -r mcp-servers/github mcp-servers/<your-tool>
cd mcp-servers/<your-tool>
# 1. package.json의 name / description 갱신.
# 2. src/github-client.ts를 사용 도구의 SDK 래퍼로 교체.
# 3. src/tools/*.ts 각각을 사용 도구 API에 맞게 재구현.
# 4. tests/ 갱신.
# 5. 이 README 갱신.
```

표준 `mdops_*` 인터페이스는 `src/tools/index.ts`에서 강제. 도구 이름과 입력
스키마는 동일하게 유지하고 구현만 바꾼다.
