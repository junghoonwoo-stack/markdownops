# Agents

LLM-agnostic system prompts for the MarkdownOps pattern.

Each file in this directory is a complete system prompt for a single agent role.
The prompts are plain Markdown. They contain no runtime-specific markup, no YAML
frontmatter required by any one tool, and no SDK calls. Drop them into any
runtime that accepts a system prompt:

- Claude Code, Codex CLI, Gemini CLI, Cursor, Continue.dev — see [runners/](../runners/).
- Direct API call to Anthropic, OpenAI, or Google — load the file as `system`.
- An MCP server's tool — pass the file content as the agent's instructions.

## Agents in this collection

| File | Role | Produces (draft mode) | Reviews (review mode) |
|---|---|---|---|
| `sales-agent.md` | Sales | `sales-requirements.md` | — |
| `product-agent.md` | Product | `productization-proposal.md` | sales-requirements |
| `engineering-agent.md` | Engineering | `software-prd.md` | productization-proposal |
| `design-agent.md` | Design | `design-brief.md` | productization-proposal, software-prd |
| `legal-reviewer.md` | Legal & Compliance | — | any artifact |
| `executive-summarizer.md` | Executive | one-page brief | — |

## Two modes per agent

Every agent supports two modes, dispatched by what the user message contains:

- **Draft mode** — input is a free-text need or an upstream artifact. Output is a
  fully-formed Markdown artifact in this agent's role.
- **Review mode** — input is an existing artifact and an explicit "review this"
  instruction. Output is a structured review block (decision, summary, concerns,
  required changes) ready to post to the coordination layer.

## Conventions

- All agent prompts are bilingual: English first, then Korean below.
- Output artifacts must be Markdown. No HTML, no PDF, no slides.
- When the input is bilingual, the output is bilingual. When the input is one
  language, the output stays in that language.
- Every artifact starts with a metadata block (owner, status, generated date,
  linked issue) so the coordination layer can parse it.

## Adding a new agent

1. Create `agents/<role>-agent.md` with the prompt structure used by the existing
   agents.
2. Make it bilingual.
3. Add a row to the table above.
4. If a runner needs an explicit registration, update `runners/*.md`.

---

## 한국어

# Agents

MarkdownOps 패턴을 위한 LLM-agnostic 시스템 프롬프트.

이 디렉터리의 각 파일은 한 역할(role)에 대한 완전한 시스템 프롬프트다. plain
Markdown으로 작성되어 있으며, 특정 runtime의 markup이나 YAML frontmatter, SDK
호출이 없다. 시스템 프롬프트를 받는 모든 runtime에 그대로 넣을 수 있다:

- Claude Code, Codex CLI, Gemini CLI, Cursor, Continue.dev — [runners/](../runners/) 참고.
- Anthropic, OpenAI, Google API 직접 호출 — 파일을 `system`으로 로드.
- MCP 서버의 도구 — 파일 내용을 agent instruction으로 전달.

## 수록된 agent

| 파일 | 역할 | 작성 (draft 모드) | 리뷰 (review 모드) |
|---|---|---|---|
| `sales-agent.md` | 영업 | 영업요구조건서 | — |
| `product-agent.md` | 상품 | 상품화 발의서 | 영업요구조건서 |
| `engineering-agent.md` | 엔지니어링 | 소프트웨어 PRD | 상품화 발의서 |
| `design-agent.md` | 디자인 | 디자인 발의서 | 상품화 발의서, PRD |
| `legal-reviewer.md` | 법무·컴플라이언스 | — | 모든 산출물 |
| `executive-summarizer.md` | 경영진 | 한 페이지 브리프 | — |

## 모든 agent는 두 모드를 지원

각 agent는 사용자 메시지의 내용에 따라 두 가지 모드 중 하나로 동작:

- **Draft 모드** — 입력이 자연어 요구나 상류 산출물. 출력은 이 agent 역할에서의
  완성된 Markdown 산출물.
- **Review 모드** — 입력이 기존 산출물 + "이걸 리뷰해" 지시. 출력은 협업 레이어에
  바로 게시할 수 있는 구조화된 리뷰 블록(결정·요약·우려·필수 변경).

## 컨벤션

- 모든 agent 프롬프트는 이중 언어: 영문 먼저, 한국어 아래.
- 산출물은 반드시 Markdown. HTML·PDF·슬라이드 아님.
- 입력이 이중 언어이면 출력도 이중 언어. 단일 언어이면 그 언어로 출력.
- 모든 산출물은 메타데이터 블록(담당·상태·작성일·연결 이슈)으로 시작해 협업
  레이어가 파싱할 수 있게 한다.

## 새 agent 추가

1. `agents/<role>-agent.md` 생성 — 기존 agent와 동일한 구조 사용.
2. 이중 언어.
3. 위 표에 행 추가.
4. runner 등록이 필요하면 `runners/*.md` 갱신.
