# Runner — OpenAI Codex CLI

Use the MarkdownOps agents and MCP servers from OpenAI's Codex CLI.

## Quick start

```sh
# 1. clone and install
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops
cd mcp-servers/github && npm install && npm run build && cd ../..

# 2. set API key
export OPENAI_API_KEY=sk-...

# 3. start Codex with an agent loaded as the system instruction
codex --system "$(cat agents/sales-agent.md)" \
      "Draft a sales-requirements.md for a fictional customer doing X."
```

The above is the simplest possible loop: agent prompt as system, your request
as user input, output to stdout.

## Loading an agent persistently

Codex reads project configuration from `.codex/config.json` (or your local
equivalent — check your installed Codex CLI version for exact path). To make
agents available to every session in this repo:

```jsonc
// .codex/config.json
{
  "agents": {
    "sales": "agents/sales-agent.md",
    "product": "agents/product-agent.md",
    "engineering": "agents/engineering-agent.md",
    "design": "agents/design-agent.md",
    "legal": "agents/legal-reviewer.md",
    "exec": "agents/executive-summarizer.md"
  }
}
```

Then invoke by name:

```sh
codex --agent sales "draft sales-requirements.md for ..."
```

If your Codex version does not support `--agent`, fall back to:

```sh
codex --system "$(cat agents/sales-agent.md)" "..."
```

## Connecting an MCP server

Codex supports MCP via its config file. Add an entry pointing at the built
server binary:

```jsonc
// .codex/config.json
{
  "mcpServers": {
    "markdownops-github": {
      "command": "node",
      "args": ["mcp-servers/github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "MDOPS_GITHUB_REPO": "owner/repo"
      }
    }
  }
}
```

Restart Codex. The `mdops_*` tools become available to the agent.

## Verifying end to end

```sh
codex --agent sales \
  "list templates/, then draft a sales-requirements.md for a customer doing X. \
   Save to artifacts/draft/, then call mdops_create_issue."
```

If the file is created, the agent prompt is governing structure, and an issue
appears in the configured GitHub repo, the runner is wired correctly.

## Notes

- Codex CLI's exact flag names evolve. Treat the snippets above as conventions
  — check `codex --help` if a flag is renamed.
- For multi-turn workflows, prefer the persistent agent registration (config
  file) over passing `--system` on each invocation.

---

## 한국어

# 러너 — OpenAI Codex CLI

OpenAI Codex CLI에서 MarkdownOps agent와 MCP 서버를 사용한다.

## 퀵스타트

```sh
# 1. 클론과 설치
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops
cd mcp-servers/github && npm install && npm run build && cd ../..

# 2. API key 설정
export OPENAI_API_KEY=sk-...

# 3. agent를 system instruction으로 로드해 Codex 시작
codex --system "$(cat agents/sales-agent.md)" \
      "X를 하는 가상 고객에 대해 sales-requirements.md를 작성해줘."
```

위는 가능한 가장 단순한 루프: agent 프롬프트는 system, 사용자 요청은 user 입력,
출력은 stdout.

## agent를 영구 로딩

Codex는 프로젝트 설정을 `.codex/config.json` (혹은 로컬 동등 — 설치된 Codex CLI
버전에서 정확한 경로 확인)에서 읽는다. 이 리포의 모든 세션에서 agent를 사용할 수
있게:

```jsonc
// .codex/config.json
{
  "agents": {
    "sales": "agents/sales-agent.md",
    "product": "agents/product-agent.md",
    "engineering": "agents/engineering-agent.md",
    "design": "agents/design-agent.md",
    "legal": "agents/legal-reviewer.md",
    "exec": "agents/executive-summarizer.md"
  }
}
```

이름으로 호출:

```sh
codex --agent sales "...에 대한 sales-requirements.md 초안"
```

사용 중인 Codex 버전이 `--agent`를 지원하지 않으면:

```sh
codex --system "$(cat agents/sales-agent.md)" "..."
```

## MCP 서버 연결

Codex는 config 파일을 통해 MCP를 지원한다. 빌드된 서버 바이너리를 가리키는 항목을 추가:

```jsonc
// .codex/config.json
{
  "mcpServers": {
    "markdownops-github": {
      "command": "node",
      "args": ["mcp-servers/github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "MDOPS_GITHUB_REPO": "owner/repo"
      }
    }
  }
}
```

Codex 재시작. `mdops_*` 도구가 agent에 노출된다.

## End-to-end 검증

```sh
codex --agent sales \
  "templates/를 나열하고 X를 하는 고객을 위한 sales-requirements.md 초안을 \
   작성해줘. artifacts/draft/에 저장하고 mdops_create_issue를 호출해줘."
```

파일이 생성되고, agent 프롬프트가 구조를 지배하며, 설정된 GitHub 리포에 이슈가
나타나면 러너가 올바르게 연결된 것이다.

## 노트

- Codex CLI의 정확한 플래그명은 진화한다. 위 스니펫은 컨벤션으로 보고 — 플래그가
  바뀌면 `codex --help`를 확인.
- 다중 턴 워크플로우는 매 호출마다 `--system`을 넘기기보다 config 파일을 통한
  영구 등록을 선호.
