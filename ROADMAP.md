# Roadmap

A running record of what MarkdownOps has shipped, what's next, and the
ground rules adopters and contributors can rely on.

Every entry below was built incrementally. Each phase is one focused commit
(or a small follow-up cluster) that anyone can review independently. The
intent is for adopters to be able to pick up the repo at any state and have
a usable subset.

## Ground rules

- **Plain Markdown is the source of truth.** Code (the MCP servers, evals,
  demo) only exists to make Markdown easier to produce, route, and check.
- **All Markdown files are bilingual** (English first, Korean below). Code
  follows English-only convention.
- **Every coordination connector exposes the same `mdops_*` tool family.**
  Switching connectors does not change agent prompts or templates.
- **Every code project has tests.** The CI matrix runs them on every push.
- **No build step on the path of least resistance.** `agents/`, `templates/`,
  `runners/`, `ontology/`, `demo/` all work without `npm install`.

## Shipped

> **Status as of 2026-05-07** — every row below is on `main` and verified by
> the CI matrix. Last commit on the development environment that produced
> phases 1A–2P: [`94298ab`](https://github.com/junghoonwoo-stack/markdownops/commit/94298ab).

### Phase 1 — Foundations

| Status | Phase | What landed |
|---|---|---|
| ✅ | 1A | `agents/` — six LLM-agnostic system prompts (sales / product / engineering / design / legal / executive). |
| ✅ | 1B | `templates/` — six artifact templates with frozen section names so reviewer agents can match. |
| ✅ | 1C | `runners/` — seven runtime guides (Claude Code, Codex, Gemini CLI, Cursor, Continue, raw API, MCP). |
| ✅ | 1D | `mcp-servers/github/` — first MCP server. Octokit + Vitest + matrix-ready CI. |

### Phase 2 — Generalization

| Status | Phase | What landed |
|---|---|---|
| ✅ | 2E | `mcp-servers/gitlab/` — same `mdops_*` family, GitLab REST. CI matrix expanded. |
| ✅ | 2F | `mcp-servers/jira/` — Jira Cloud REST v2. Status as labels; assignee + watchers split. |
| ✅ | 2G | `mcp-servers/linear/` — GraphQL backend. Lazy team / label / user resolution; auto-create labels. |
| ✅ | 2H | `mcp-servers/notion/` — Notion DB as coordination. Markdown ↔ block converter. |
| ✅ | 2I | `Makefile`, `install.sh`, `install.ps1` — one-command install across every server. |
| ✅ | 2J | `evals/` — deterministic structural checks plus an opt-in LLM-as-judge stage. CI runs the deterministic side. |
| ✅ | 2K | `ontology/` — defaults plus three org-shape examples (saas-startup, enterprise-bank, design-agency). |
| ✅ | 2L | `mcp-servers/asana/` — Asana REST. Tag-based status; assignee + followers. (Slack was dropped — does not fit the standard tool family.) |
| ✅ | 2M | Demo scenario switcher — picks between the original ACME bank scenario and a new Halo SaaS self-serve billing scenario. |
| ✅ | 2N | Root README refresh — explicit "what you get when you clone this" section, install/eval commands surfaced, repository map updated. |
| ✅ | 2O | Eval fixtures expanded — good/bad pair for every artifact spec (sales-requirements / productization-proposal / software-prd / design-brief). |
| ✅ | 2P | This file. |

## Next

These items are open and small enough that a contributor (human or agent)
can pick them up without a roadmap dependency.

### Connectors

- `mcp-servers/clickup/` — same standard tools, ClickUp REST.
- `mcp-servers/internal-rest/` — a generic adapter template for in-house
  workflow systems (config-driven endpoint mapping).
- `mcp-servers/slack-notify/` — *not* a coordination connector. A side
  channel that posts notifications when a coordination unit changes status.
  Different tool prefix (`mdops_notify_*`) so it is clearly out-of-band.

### Eval enhancements

- Specs for `decision-memo` and `meeting-minutes` — currently registered
  but no example fixtures.
- A `--judge` integration test gated behind `ANTHROPIC_API_KEY` (skipped
  in CI but runnable locally).
- Per-spec quality benchmarks — track judge scores over time as agent
  prompts evolve.

### Demo

- A third scenario, ideally for the design-agency ontology shape.
- "Live" mode improvements: the API key prompt could use a proper modal,
  and the live calls could stream output instead of waiting for the full
  response.

### Pattern documentation

- Convert the demo's recorded reviewer comments into a `case-studies/`
  directory so adopters can read realistic examples without running the
  demo.
- An `adapters/` directory expansion — `linear.md`, `notion.md`,
  `asana.md` written as conceptual mappings (the existing `jira.md` has
  been the only one for a while).
- Long-form rationale for the `mdops:status:*` label convention vs. native
  workflow states.

### Repository hygiene

- A pre-commit hook that runs the evals against any new fixture under
  `evals/examples/` to catch broken samples early.
- A `CONTRIBUTING.md` summarizing the conventions distilled into "Ground
  rules" above plus the bilingual-files rule.

## How to pick something up

1. Pick an item from "Next."
2. Use the closest existing entry as a template. (E.g. building a new MCP
   connector? Start from `mcp-servers/asana/` — it was built with the
   "copy from a sibling" pattern in mind.)
3. Follow the ground rules above. The CI matrix is the canary; if your
   change breaks a connector you didn't touch, fix the regression in the
   same PR.
4. Add a row to "Shipped" with a phase letter that follows the last one.
   Roadmap entries are not pre-allocated.

---

## 한국어

# 로드맵

MarkdownOps가 무엇을 출시했고, 다음에 무엇을 만들고, 도입자/기여자가 의존할
수 있는 지반 규칙은 무엇인지를 기록한다.

아래 모든 항목은 점진적으로 만들어졌다. 각 phase는 독립적으로 리뷰 가능한
한 commit(또는 작은 후속 클러스터). 도입자가 어느 시점의 리포를 가져가도 사용
가능한 부분집합을 갖도록 설계되었다.

## 지반 규칙

- **plain Markdown이 source of truth.** 코드(MCP 서버, evals, demo)는
  Markdown을 더 쉽게 만들고 라우팅하고 검사하기 위해서만 존재.
- **모든 Markdown 파일은 이중 언어** (영문 먼저, 한국어 아래). 코드는 영문 유지.
- **모든 협업 커넥터는 동일한 `mdops_*` 도구군을 노출.** 커넥터를 바꿔도 agent
  프롬프트나 템플릿은 바뀌지 않는다.
- **모든 코드 프로젝트에 테스트.** CI 매트릭스가 매 push마다 실행.
- **가장 쉬운 경로에는 빌드 단계 없음.** `agents/`, `templates/`, `runners/`,
  `ontology/`, `demo/`는 `npm install` 없이 동작.

## 출시

> **2026-05-07 기준** — 아래 모든 항목은 `main`에 반영되어 있고 CI 매트릭스로
> 검증됨. phase 1A–2P를 만든 개발 환경의 마지막 commit:
> [`94298ab`](https://github.com/junghoonwoo-stack/markdownops/commit/94298ab).

### Phase 1 — 기초

| 상태 | Phase | 내용 |
|---|---|---|
| ✅ | 1A | `agents/` — 6개 LLM-agnostic 시스템 프롬프트 (영업/상품/엔지니어링/디자인/법무/경영진). |
| ✅ | 1B | `templates/` — 6개 산출물 템플릿. 리뷰어 agent가 매칭할 수 있도록 섹션명 고정. |
| ✅ | 1C | `runners/` — 7개 runtime 가이드 (Claude Code, Codex, Gemini CLI, Cursor, Continue, raw API, MCP). |
| ✅ | 1D | `mcp-servers/github/` — 첫 MCP 서버. Octokit + Vitest + 매트릭스-ready CI. |

### Phase 2 — 일반화

| 상태 | Phase | 내용 |
|---|---|---|
| ✅ | 2E | `mcp-servers/gitlab/` — 동일 `mdops_*` 도구군, GitLab REST. CI 매트릭스 확장. |
| ✅ | 2F | `mcp-servers/jira/` — Jira Cloud REST v2. 라벨로 상태 표현; assignee + watchers 분리. |
| ✅ | 2G | `mcp-servers/linear/` — GraphQL 백엔드. team/label/user 지연 해석; 라벨 자동 생성. |
| ✅ | 2H | `mcp-servers/notion/` — Notion DB를 coordination으로. Markdown ↔ 블록 변환기. |
| ✅ | 2I | `Makefile`, `install.sh`, `install.ps1` — 모든 서버에 대한 단일 명령 설치. |
| ✅ | 2J | `evals/` — 결정적 구조 검사 + 옵트인 LLM-as-judge. CI는 결정적 부분 실행. |
| ✅ | 2K | `ontology/` — 기본 + 조직 형태 예시 3개 (saas-startup, enterprise-bank, design-agency). |
| ✅ | 2L | `mcp-servers/asana/` — Asana REST. 태그 기반 상태; assignee + followers. (Slack은 표준 도구군에 안 맞아 제외.) |
| ✅ | 2M | 데모 시나리오 스위처 — 기존 ACME 은행 시나리오와 새 Halo SaaS 셀프서브 빌링 시나리오 사이 전환. |
| ✅ | 2N | 루트 README 갱신 — 명시적 "클론 시 받는 자산" 섹션, install/eval 명령 노출, 리포 맵 갱신. |
| ✅ | 2O | eval 픽스처 확장 — 모든 spec(sales-requirements/productization-proposal/software-prd/design-brief)에 대한 good/bad 쌍. |
| ✅ | 2P | 이 파일. |

## 다음

오픈 항목들. 로드맵 의존성 없이 기여자(사람이든 agent든)가 집어들 수 있을
만큼 작다.

### 커넥터

- `mcp-servers/clickup/` — 동일 표준 도구, ClickUp REST.
- `mcp-servers/internal-rest/` — 사내 워크플로우 시스템을 위한 일반 어댑터
  템플릿 (config 기반 엔드포인트 매핑).
- `mcp-servers/slack-notify/` — *coordination 커넥터가 아님*. 협업 단위
  상태 변화 시 알림을 보내는 사이드 채널. 도구 접두를 다르게 (`mdops_notify_*`)
  해서 표준 도구군 밖임을 명확히.

### eval 강화

- `decision-memo`와 `meeting-minutes`의 spec — 등록은 되어 있으나 픽스처 없음.
- `ANTHROPIC_API_KEY` 게이트의 `--judge` 통합 테스트 (CI 스킵, 로컬 실행).
- spec별 품질 벤치마크 — agent 프롬프트가 진화함에 따라 judge 점수 추이 추적.

### 데모

- 세 번째 시나리오. 디자인 에이전시 온톨로지 형태가 자연스러움.
- "Live" 모드 개선: API key 입력은 모달로, 스트리밍 출력 지원.

### 패턴 문서

- 데모의 녹화 리뷰어 코멘트를 `case-studies/` 디렉터리로 옮겨 데모를 돌리지
  않아도 현실적인 예시를 읽을 수 있게.
- `adapters/` 디렉터리 확장 — `linear.md`, `notion.md`, `asana.md`를
  개념 매핑으로 작성 (기존엔 `jira.md`만 있었음).
- 네이티브 워크플로우 상태 vs `mdops:status:*` 라벨 컨벤션의 장문 설명.

### 리포 위생

- `evals/examples/` 아래 새 픽스처에 대해 evals를 자동 실행하는 pre-commit
  훅으로 깨진 샘플 조기 검출.
- 위 "지반 규칙"을 정리한 `CONTRIBUTING.md` + 이중 언어 규칙 명시.

## 집어드는 방법

1. "다음"에서 항목 선택.
2. 가장 가까운 기존 항목을 템플릿으로. (예: 새 MCP 커넥터? `mcp-servers/asana/`
   에서 출발 — "형제에서 복사" 패턴을 염두에 두고 만들어짐.)
3. 위 지반 규칙을 따른다. CI 매트릭스가 카나리. 건드리지 않은 커넥터를 깨면
   같은 PR에서 회귀 수정.
4. "출시"에 마지막 phase 다음 글자로 행 추가. 로드맵 항목은 미리 할당되지 않는다.
