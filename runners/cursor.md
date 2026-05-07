# Runner — Cursor

Use the MarkdownOps agents and MCP servers from inside Cursor.

## Quick start

```sh
# 1. clone the repo and open in Cursor
git clone https://github.com/junghoonwoo-stack/markdownops.git
cursor markdownops

# 2. install one MCP server (example: GitHub)
cd markdownops/mcp-servers/github && npm install && npm run build && cd -
```

Cursor opens in the repo. The agents and templates are visible in the file tree.

## Loading an agent

Cursor's Composer (Cmd/Ctrl+I) and Chat (Cmd/Ctrl+L) both accept a system-style
prompt. Three options, in order of stickiness:

**Option A — `.cursorrules` for default behavior**

Add a project-level `.cursorrules` file at the repo root:

```
For MarkdownOps tasks, before producing or reviewing an artifact, read the
matching agent prompt from agents/ and use it as your system instruction.

Agent → file mapping:
- Sales → agents/sales-agent.md
- Product → agents/product-agent.md
- Engineering → agents/engineering-agent.md
- Design → agents/design-agent.md
- Legal → agents/legal-reviewer.md
- Executive → agents/executive-summarizer.md

Output Markdown only. Match the input language.
```

**Option B — paste the agent into Composer for one task**

Open Composer (Cmd/Ctrl+I), paste the contents of `agents/<agent>.md` as the
opening system message, then describe the customer / artifact request.

**Option C — keep the agent file open**

Cursor includes open files as context. Open `agents/<agent>.md` and
`templates/<template>.md` in tabs before asking Cursor to produce the artifact.

## Connecting an MCP server

Cursor supports MCP servers via `~/.cursor/mcp.json`:

```jsonc
// ~/.cursor/mcp.json
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

Restart Cursor. In Composer or Chat, the `mdops_*` tools become available.

## Verifying end to end

In Composer:

```
List the files in templates/, then use agents/sales-agent.md as your system
prompt and draft a sales-requirements.md for a fictional customer doing X.
Save to artifacts/draft/. After saving, call mdops_create_issue with the
artifact path attached.
```

If the file is written, the agent's structure governs the output, and a real
GitHub issue is created, the runner is wired.

## Notes

- Cursor's Composer is the right surface for multi-step MarkdownOps work; Chat
  is fine for single-shot drafts and reviews.
- `.cursorrules` applies to every interaction in the repo; weigh that before
  putting strict directives there.

---

## 한국어

# 러너 — Cursor

Cursor 안에서 MarkdownOps agent와 MCP 서버를 사용한다.

## 퀵스타트

```sh
# 1. 리포 클론하고 Cursor로 열기
git clone https://github.com/junghoonwoo-stack/markdownops.git
cursor markdownops

# 2. MCP 서버 하나 설치 (예: GitHub)
cd markdownops/mcp-servers/github && npm install && npm run build && cd -
```

Cursor가 리포에서 열린다. agent와 템플릿이 파일 트리에 보인다.

## agent 로딩

Cursor의 Composer (Cmd/Ctrl+I)와 Chat (Cmd/Ctrl+L)은 모두 시스템 프롬프트를
받는다. 세 가지 옵션, 영속성 순:

**옵션 A — 기본 동작은 `.cursorrules`로**

리포 루트에 프로젝트 레벨 `.cursorrules` 파일 추가:

```
MarkdownOps 작업의 경우, 산출물 생성/리뷰 전에 agents/에서 해당하는 agent
프롬프트를 읽어 system instruction으로 사용한다.

Agent → 파일 매핑:
- 영업 → agents/sales-agent.md
- 상품 → agents/product-agent.md
- 엔지니어링 → agents/engineering-agent.md
- 디자인 → agents/design-agent.md
- 법무 → agents/legal-reviewer.md
- 경영진 → agents/executive-summarizer.md

출력은 Markdown만. 입력 언어 일치.
```

**옵션 B — 한 번의 작업을 위해 Composer에 붙여넣기**

Composer (Cmd/Ctrl+I)를 열고 `agents/<agent>.md` 내용을 시작 system 메시지로
붙여넣은 뒤 고객/산출물 요청을 기술한다.

**옵션 C — agent 파일을 탭에 열어두기**

Cursor는 열려 있는 파일을 컨텍스트로 포함한다. Cursor에 산출물을 요청하기 전
`agents/<agent>.md`와 `templates/<template>.md`를 탭에 열어둔다.

## MCP 서버 연결

Cursor는 `~/.cursor/mcp.json`을 통한 MCP 서버를 지원:

```jsonc
// ~/.cursor/mcp.json
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

Cursor 재시작. Composer/Chat에서 `mdops_*` 도구가 사용 가능해진다.

## End-to-end 검증

Composer에서:

```
templates/의 파일을 나열하고, agents/sales-agent.md를 system prompt로 사용해
X를 하는 가상 고객을 위한 sales-requirements.md 초안을 작성해줘.
artifacts/draft/에 저장. 저장 후 산출물 경로를 첨부해 mdops_create_issue를 호출.
```

파일이 작성되고, agent 구조가 출력을 지배하며, 실제 GitHub 이슈가 생성되면
러너가 연결된 것이다.

## 노트

- Cursor의 Composer가 다중 단계 MarkdownOps 작업에 적합한 표면. Chat은
  단발성 작성·리뷰에 적합.
- `.cursorrules`는 리포 안 모든 상호작용에 적용되니, 엄격한 지시를 넣을 때 유의.
