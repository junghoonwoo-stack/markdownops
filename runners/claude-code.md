# Runner — Claude Code

Use the MarkdownOps agents and MCP servers from inside Claude Code.

## Quick start

```sh
# 1. clone the repo
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops

# 2. install one MCP server (example: GitHub)
cd mcp-servers/github && npm install && npm run build && cd ../..

# 3. start Claude Code in this repo
claude
```

In the Claude Code session, point the conversation at an agent:

```
Read agents/sales-agent.md as your system prompt for this turn, then draft a
sales-requirements.md from this customer context: ...
```

## Loading an agent persistently

Two options:

**Option A — project-scoped agent files**

Claude Code reads agent definitions from `.claude/agents/` in the project. Copy
the agents you want to use:

```sh
mkdir -p .claude/agents
cp agents/sales-agent.md .claude/agents/
cp agents/product-agent.md .claude/agents/
# ... and so on
```

Now you can invoke them via the Agent tool by name in any session in this repo.

**Option B — let CLAUDE.md describe the convention**

Put a one-line directive in your project `CLAUDE.md`:

```
For MarkdownOps roles, load the relevant prompt from agents/ before producing
the artifact. For reviews, load the same agent prompt and request review mode.
```

This is lighter weight; no file copying. Works as long as the agent files exist
in the repo.

## Connecting an MCP server

Once you've installed an MCP server (e.g. `mcp-servers/github/`), register it
with Claude Code. From the repo root:

```sh
claude mcp add markdownops-github -- node mcp-servers/github/dist/index.js
```

Set the server's environment variables in your shell or in a `.env` file the
server reads (see each server's README).

Verify the tools are available:

```
/mcp
```

You should see `markdownops-github` listed and the `mdops_*` tools registered.

## Verifying end to end

In a Claude Code session inside the repo:

```
List the templates in templates/, then use agents/sales-agent.md to draft a
sales-requirements.md for a fictional customer. Save it to artifacts/draft/.
After saving, call mdops_create_issue with the artifact's path attached.
```

If all three pieces work — file read, agent prompt loaded, MCP tool called —
the runner is wired correctly.

---

## 한국어

# 러너 — Claude Code

Claude Code 안에서 MarkdownOps agent와 MCP 서버를 사용한다.

## 퀵스타트

```sh
# 1. 리포 클론
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops

# 2. MCP 서버 하나 설치 (예: GitHub)
cd mcp-servers/github && npm install && npm run build && cd ../..

# 3. 이 리포에서 Claude Code 시작
claude
```

Claude Code 세션에서 agent를 가리킨다:

```
agents/sales-agent.md를 이번 턴의 system prompt로 읽고, 다음 고객 맥락에서
sales-requirements.md 초안을 작성해줘: ...
```

## agent를 영구 로딩

두 가지 옵션:

**옵션 A — 프로젝트 범위 agent 파일**

Claude Code는 프로젝트의 `.claude/agents/`에서 agent 정의를 읽는다. 사용할 agent를
복사한다:

```sh
mkdir -p .claude/agents
cp agents/sales-agent.md .claude/agents/
cp agents/product-agent.md .claude/agents/
# ... 등
```

이제 이 리포의 모든 세션에서 Agent 도구로 이름을 호출할 수 있다.

**옵션 B — CLAUDE.md에 컨벤션을 적기**

프로젝트 `CLAUDE.md`에 한 줄 지시를 둔다:

```
MarkdownOps 역할에 대해서는 산출물 작성 전 agents/에서 해당 프롬프트를 로드한다.
리뷰의 경우 같은 agent 프롬프트를 로드하고 review 모드로 요청한다.
```

가벼운 방식. 파일 복사 없음. 리포에 agent 파일이 있는 한 동작.

## MCP 서버 연결

MCP 서버(예: `mcp-servers/github/`)를 설치한 뒤 Claude Code에 등록한다. 리포 루트에서:

```sh
claude mcp add markdownops-github -- node mcp-servers/github/dist/index.js
```

서버의 환경 변수는 shell이나 서버가 읽는 `.env`에 설정 (각 서버 README 참고).

도구 가용성 확인:

```
/mcp
```

`markdownops-github`이 목록에 있고 `mdops_*` 도구가 등록되어 있어야 한다.

## End-to-end 검증

리포 안의 Claude Code 세션에서:

```
templates/의 템플릿을 나열하고, agents/sales-agent.md로 가상의 고객을 위한
sales-requirements.md를 작성해줘. artifacts/draft/에 저장해줘. 저장 후
산출물 경로를 첨부해 mdops_create_issue를 호출해줘.
```

세 조각 — 파일 읽기, agent 프롬프트 로드, MCP 도구 호출 — 이 모두 동작하면
러너 배선이 올바른 것이다.
