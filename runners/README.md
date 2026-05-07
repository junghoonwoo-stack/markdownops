# Runners

Thin guides for loading the [agents/](../agents/) and connecting the
[mcp-servers/](../mcp-servers/) into common LLM runtimes.

The agents are plain Markdown system prompts. The MCP servers expose the
standard `mdops_*` tool family. Each runner below is a short page explaining
**where to paste / point** so a given runtime picks them up.

## Available runners

| Runner | Loads agents via | Connects MCP via |
|---|---|---|
| [claude-code.md](claude-code.md) | `~/.claude/agents/` or project `.claude/` | `claude mcp add` / `mcp.json` |
| [codex.md](codex.md) | `--system` flag or Codex config | OpenAI MCP support / Codex MCP config |
| [gemini-cli.md](gemini-cli.md) | `--system-instruction` / config | Gemini MCP integration |
| [cursor.md](cursor.md) | `.cursorrules` or Composer system | `~/.cursor/mcp.json` |
| [continue.md](continue.md) | Continue config `systemMessage` | Continue MCP block |
| [raw-api.md](raw-api.md) | `system` parameter on each call | Direct REST calls (no MCP) |
| [mcp.md](mcp.md) | (any runtime that speaks MCP) | this runner explains the protocol |

## How runners work

A runner does three things:

1. **Loads an agent prompt** — by reading a file from `agents/` and passing it
   as the runtime's system / instructions input.
2. **Connects an MCP server** — so the agent can call `mdops_create_issue`,
   `mdops_add_comment`, etc., against a real coordination layer.
3. **Names the working directory** — so the agent can read `templates/` and
   write artifacts back to disk.

That's it. Runners do not contain agent logic. The agent logic lives in the
agent prompt itself.

## Pick a runner

- You are on Claude Code → [`claude-code.md`](claude-code.md)
- You are on OpenAI Codex CLI → [`codex.md`](codex.md)
- You are on Gemini CLI → [`gemini-cli.md`](gemini-cli.md)
- You are inside Cursor → [`cursor.md`](cursor.md)
- You are inside VS Code with Continue → [`continue.md`](continue.md)
- You are calling an LLM API directly → [`raw-api.md`](raw-api.md)
- You want to understand the MCP layer before picking → [`mcp.md`](mcp.md)

## Adding a runner

If your runtime is not listed, add a new file with the same shape as the
existing runners:

1. **Quick start** — three commands or three steps.
2. **Loading an agent** — exact path / config key to use.
3. **Connecting an MCP server** — exact config snippet.
4. **Verifying** — a one-line check.
5. **Bilingual** — English first, Korean below.

---

## 한국어

# 러너

[agents/](../agents/)를 로딩하고 [mcp-servers/](../mcp-servers/)를 연결하는,
일반적인 LLM runtime별 얇은 가이드.

agent는 plain Markdown 시스템 프롬프트다. MCP 서버는 표준 `mdops_*` 도구군을
노출한다. 아래 각 runner는 **어디에 붙여넣고 무엇을 가리키는지** 한 페이지로
설명한다.

## 수록 러너

| 러너 | agent 로딩 위치 | MCP 연결 방법 |
|---|---|---|
| [claude-code.md](claude-code.md) | `~/.claude/agents/` 또는 프로젝트 `.claude/` | `claude mcp add` / `mcp.json` |
| [codex.md](codex.md) | `--system` 플래그 또는 Codex config | OpenAI MCP 지원 / Codex MCP config |
| [gemini-cli.md](gemini-cli.md) | `--system-instruction` / config | Gemini MCP 통합 |
| [cursor.md](cursor.md) | `.cursorrules` 또는 Composer 시스템 | `~/.cursor/mcp.json` |
| [continue.md](continue.md) | Continue config `systemMessage` | Continue MCP 블록 |
| [raw-api.md](raw-api.md) | 매 호출의 `system` 파라미터 | 직접 REST 호출 (MCP 없음) |
| [mcp.md](mcp.md) | (MCP를 말하는 모든 runtime) | 이 러너가 프로토콜을 설명 |

## 러너의 역할

러너는 세 가지를 한다:

1. **agent 프롬프트 로딩** — `agents/`에서 파일을 읽어 runtime의 system /
   instructions 입력으로 전달.
2. **MCP 서버 연결** — agent가 실제 협업 레이어에 대해 `mdops_create_issue`,
   `mdops_add_comment` 등을 호출할 수 있게.
3. **작업 디렉터리 명명** — agent가 `templates/`를 읽고 산출물을 디스크에 쓸
   수 있게.

이게 전부. 러너는 agent 로직을 담지 않는다. agent 로직은 agent 프롬프트 자체에 있다.

## 러너 고르기

- Claude Code 사용자 → [`claude-code.md`](claude-code.md)
- OpenAI Codex CLI 사용자 → [`codex.md`](codex.md)
- Gemini CLI 사용자 → [`gemini-cli.md`](gemini-cli.md)
- Cursor 안 → [`cursor.md`](cursor.md)
- VS Code + Continue → [`continue.md`](continue.md)
- LLM API 직접 호출 → [`raw-api.md`](raw-api.md)
- MCP 레이어 먼저 이해 → [`mcp.md`](mcp.md)

## 러너 추가

목록에 없는 runtime이라면 기존 러너와 같은 형태로 새 파일을 추가한다:

1. **퀵스타트** — 명령 3개 또는 단계 3개.
2. **agent 로딩** — 정확한 경로/설정 키.
3. **MCP 서버 연결** — 정확한 config 스니펫.
4. **검증** — 한 줄 체크.
5. **이중 언어** — 영문 먼저, 한국어 아래.
