# Runner — Gemini CLI

Use the MarkdownOps agents and MCP servers from Google's Gemini CLI.

## Quick start

```sh
# 1. clone and install
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops
cd mcp-servers/github && npm install && npm run build && cd ../..

# 2. set API key
export GOOGLE_API_KEY=...

# 3. start Gemini with an agent loaded as system instruction
gemini --system-instruction "$(cat agents/sales-agent.md)" \
       "Draft a sales-requirements.md for a fictional customer doing X."
```

## Loading an agent persistently

Gemini CLI supports a settings file at `~/.gemini/settings.json` and a per-project
override at `.gemini/settings.json`. Add a `markdownops` block:

```jsonc
// .gemini/settings.json
{
  "systemPrompts": {
    "sales": "agents/sales-agent.md",
    "product": "agents/product-agent.md",
    "engineering": "agents/engineering-agent.md",
    "design": "agents/design-agent.md",
    "legal": "agents/legal-reviewer.md",
    "exec": "agents/executive-summarizer.md"
  }
}
```

Invoke a session with a named agent:

```sh
gemini --use-prompt sales "Draft sales-requirements.md for ..."
```

If your Gemini CLI version does not have a built-in named-prompt option, fall
back to passing the file content:

```sh
gemini --system-instruction "$(cat agents/sales-agent.md)" "..."
```

## Connecting an MCP server

Gemini CLI supports MCP servers via the same `settings.json`:

```jsonc
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

Restart Gemini. Verify with `/mcp` (if your version supports it) or by asking
the agent to list available tools.

## Verifying end to end

```sh
gemini --use-prompt sales \
  "list templates/, draft sales-requirements.md for X, save to artifacts/draft/, \
   then call mdops_create_issue with the artifact path."
```

## Notes

- Gemini CLI distributions vary across vendors; the flag and config-key names
  above reflect common conventions but may differ in your specific build.
- For long-context artifacts, Gemini's large window handles the full agent
  prompt plus several Markdown source files comfortably — no chunking needed.

---

## 한국어

# 러너 — Gemini CLI

Google Gemini CLI에서 MarkdownOps agent와 MCP 서버를 사용한다.

## 퀵스타트

```sh
# 1. 클론과 설치
git clone https://github.com/junghoonwoo-stack/markdownops.git
cd markdownops
cd mcp-servers/github && npm install && npm run build && cd ../..

# 2. API key 설정
export GOOGLE_API_KEY=...

# 3. agent를 system instruction으로 로드해 Gemini 시작
gemini --system-instruction "$(cat agents/sales-agent.md)" \
       "X를 하는 가상 고객에 대해 sales-requirements.md를 작성해줘."
```

## agent를 영구 로딩

Gemini CLI는 `~/.gemini/settings.json` (글로벌)과 `.gemini/settings.json`
(프로젝트 오버라이드) 설정 파일을 지원한다. `markdownops` 블록을 추가:

```jsonc
// .gemini/settings.json
{
  "systemPrompts": {
    "sales": "agents/sales-agent.md",
    "product": "agents/product-agent.md",
    "engineering": "agents/engineering-agent.md",
    "design": "agents/design-agent.md",
    "legal": "agents/legal-reviewer.md",
    "exec": "agents/executive-summarizer.md"
  }
}
```

명명된 agent로 세션 시작:

```sh
gemini --use-prompt sales "...에 대한 sales-requirements.md 초안"
```

사용 중인 Gemini CLI 버전이 명명 프롬프트 옵션을 내장하지 않으면 파일 내용 전달로
대체:

```sh
gemini --system-instruction "$(cat agents/sales-agent.md)" "..."
```

## MCP 서버 연결

Gemini CLI는 동일한 `settings.json`으로 MCP 서버를 지원:

```jsonc
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

Gemini 재시작. 버전이 지원하면 `/mcp`로 검증, 아니면 agent에게 사용 가능한 도구를
나열하도록 요청.

## End-to-end 검증

```sh
gemini --use-prompt sales \
  "templates/를 나열하고, X를 하는 고객을 위한 sales-requirements.md 초안을
   artifacts/draft/에 저장한 뒤 산출물 경로로 mdops_create_issue를 호출해줘."
```

## 노트

- Gemini CLI 배포는 벤더별로 다양하다. 위 플래그·설정키 이름은 일반 컨벤션이지만
  사용 중인 빌드와 다를 수 있다.
- 장문 산출물의 경우 Gemini의 큰 윈도우가 agent 프롬프트와 여러 Markdown source
  파일을 청크 없이 무리 없이 다룬다.
