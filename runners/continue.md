# Runner — Continue.dev

Use the MarkdownOps agents and MCP servers from Continue inside VS Code or
JetBrains.

## Quick start

```sh
git clone https://github.com/junghoonwoo-stack/markdownops.git
code markdownops    # or your JetBrains IDE
cd markdownops/mcp-servers/github && npm install && npm run build && cd -
```

In Continue's sidebar, configure a model with one of the MarkdownOps agents as
its system message.

## Loading an agent

Continue's config lives at `~/.continue/config.json` (or the YAML variant). Add
a `models` entry per agent role:

```jsonc
// ~/.continue/config.json
{
  "models": [
    {
      "title": "MarkdownOps — Sales",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "apiKey": "<your-key>",
      "systemMessage": "<paste contents of agents/sales-agent.md here>"
    },
    {
      "title": "MarkdownOps — Product",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "apiKey": "<your-key>",
      "systemMessage": "<paste contents of agents/product-agent.md here>"
    }
    // ... add the rest
  ]
}
```

For long agent prompts, Continue can also load `systemMessage` from a file:

```jsonc
{
  "title": "MarkdownOps — Sales",
  "model": "claude-sonnet-4-5",
  "systemMessageFile": "/absolute/path/to/markdownops/agents/sales-agent.md"
}
```

In the Continue sidebar, switch the active model to the agent you need before
asking it to produce or review an artifact.

## Connecting an MCP server

Continue supports MCP via the `mcpServers` block in the same config:

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

Reload Continue (`Continue: Reload window`). The `mdops_*` tools become available
to whichever agent model you have selected.

## Verifying end to end

With the "MarkdownOps — Sales" model active, in the Continue chat:

```
List templates/, draft a sales-requirements.md for a customer doing X, save to
artifacts/draft/, and call mdops_create_issue with the artifact path.
```

## Notes

- Continue's `systemMessageFile` keeps the config file small and keeps the agent
  authoritative source in the repo.
- If you have many MarkdownOps agents and your model list gets long, prefix
  every title with `MarkdownOps — ` so they stay grouped in the sidebar dropdown.

---

## 한국어

# 러너 — Continue.dev

VS Code 또는 JetBrains 안의 Continue에서 MarkdownOps agent와 MCP 서버를 사용한다.

## 퀵스타트

```sh
git clone https://github.com/junghoonwoo-stack/markdownops.git
code markdownops    # 또는 사용 중인 JetBrains IDE
cd markdownops/mcp-servers/github && npm install && npm run build && cd -
```

Continue 사이드바에서 MarkdownOps agent 중 하나를 system message로 갖는 모델을 설정.

## agent 로딩

Continue 설정은 `~/.continue/config.json` (또는 YAML 변형)에 있다. 각 agent 역할별
`models` 항목을 추가:

```jsonc
// ~/.continue/config.json
{
  "models": [
    {
      "title": "MarkdownOps — Sales",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "apiKey": "<your-key>",
      "systemMessage": "<agents/sales-agent.md 내용을 여기 붙여넣기>"
    },
    {
      "title": "MarkdownOps — Product",
      "provider": "anthropic",
      "model": "claude-sonnet-4-5",
      "apiKey": "<your-key>",
      "systemMessage": "<agents/product-agent.md 내용을 여기 붙여넣기>"
    }
    // ... 나머지 추가
  ]
}
```

긴 agent 프롬프트는 Continue가 파일에서 `systemMessage`를 로드할 수도 있다:

```jsonc
{
  "title": "MarkdownOps — Sales",
  "model": "claude-sonnet-4-5",
  "systemMessageFile": "/absolute/path/to/markdownops/agents/sales-agent.md"
}
```

Continue 사이드바에서 산출물을 작성/리뷰 요청하기 전 활성 모델을 필요한 agent로 전환.

## MCP 서버 연결

Continue는 같은 config의 `mcpServers` 블록으로 MCP를 지원:

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

Continue 다시 로드 (`Continue: Reload window`). 선택된 agent 모델에 `mdops_*`
도구가 노출된다.

## End-to-end 검증

"MarkdownOps — Sales" 모델 활성 상태에서, Continue 채팅에:

```
templates/를 나열하고, X를 하는 고객을 위한 sales-requirements.md 초안을
artifacts/draft/에 저장한 뒤 산출물 경로로 mdops_create_issue를 호출해줘.
```

## 노트

- `systemMessageFile`은 config 파일을 작게 유지하고 agent의 권위 있는 source를
  리포 안에 두게 한다.
- MarkdownOps agent가 많아 모델 목록이 길어지면, 사이드바 드롭다운에서 그룹지어
  보이도록 모든 title을 `MarkdownOps — `로 접두 처리.
