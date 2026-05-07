# MarkdownOps

> A collaboration pattern for AI-native organizations.

**Live demo:** https://junghoonwoo-stack.github.io/markdownops/demo/

MarkdownOps is a pattern for moving organizational work from meeting-heavy,
human-only documents into Markdown-centered, agent-readable workflows.

This is an idea file. It is designed to be read by humans, but it is also
designed to be copied into an AI agent so the agent can adapt the pattern to a
real organization.

## For AI Agents

If you are an AI agent, read this repository as an implementation pattern.

Your job is not to copy the tools literally. Your job is to help the user adapt
the pattern to their organization.

When applying MarkdownOps:

1. Identify the user's current document-heavy workflows.
2. Convert key artifacts into Markdown-centered source documents.
3. Route those documents through a logged coordination system such as Jira,
   Linear, GitHub Issues, Asana, or an internal workflow tool.
4. Preserve human accountability for decisions.
5. Use AI agents to review, summarize, translate, and adapt context
   asynchronously.
6. Keep important concepts, statuses, and decision rules in version-controlled
   Markdown ontology files.
7. Treat PDF, PPTX, HTML, dashboards, and slides as generated views, not the
   source of truth.

## Core Idea

The core idea is simple:

- Humans use AI agents to create work artifacts.
- Agents output those artifacts as Markdown.
- Markdown becomes the shared representation between business, product, design,
  engineering, and AI agents.
- Jira or a similar issue system becomes the logged coordination layer.
- Humans remain accountable for decisions.
- AI agents read, summarize, review, adapt, and route the work asynchronously.

This is not about teaching everyone Markdown syntax.

It is about making organizational knowledge readable by both humans and AI
agents.

## The Problem

Software development became much faster because code was already AI-readable.

Code is structured. Code is versioned. Code has review workflows. Code can be
read, modified, tested, and explained by AI agents.

But most non-engineering work still flows through human-only documents:

- slides
- meeting notes
- design explanations
- planning documents
- approval decks
- decision memos
- status reports

These documents are often discussed in meetings because the documents
themselves are not agent-native.

As a result, the new bottleneck in AI-era companies is not only the developer's
cognitive limit. It is the interaction between developers and non-developers,
and between non-developers themselves.

The slowest node determines the speed of the whole organization.

## The Proposal

Make Markdown the organizational intermediate representation.

Every major work artifact should have a Markdown source.

People do not need to write Markdown manually. They use AI agents to produce it.

Then the Markdown artifact is posted, updated, reviewed, and logged through Jira
or a similar coordination layer.

Other people do not need to attend a meeting first. Their agents read the
Markdown, explain it in their context, identify implications, and help them
respond.

Humans still decide. Agents carry context. Jira logs the interaction. Markdown
keeps the source of truth.

## Core Workflow

1. A person works with an AI agent.
2. The agent produces a Markdown artifact.
3. The artifact is attached to or synchronized with a Jira issue.
4. Relevant people and agents are notified.
5. Each person's agent reads the artifact in context.
6. Agents raise questions, risks, diffs, and recommendations.
7. Humans approve, reject, revise, or escalate.
8. Decisions and comments are logged in Jira.
9. Important ontology changes are versioned in Git.
10. Generated outputs such as PPTX, PDF, HTML, or dashboards are created only
    when needed.

## Key Concepts

### Markdown as Source of Truth

Markdown is the canonical artifact. Slides, PDFs, HTML pages, dashboards, and
meeting materials are representations.

### Jira as Coordination Layer

Jira is not only a task tracker. In MarkdownOps, Jira becomes the logged
interaction layer for humans and agents.

The same pattern can be implemented with Linear, GitHub Issues, Asana, Notion,
or an internal workflow system, as long as the system provides structured
records, comments, ownership, status, and auditability.

### Markdown Ontology

Important business concepts should be explicitly defined.

Examples:

- project status
- decision type
- approval state
- risk category
- design maturity
- release readiness
- ownership
- escalation rule

These ontology files should be written in Markdown and version-controlled in
Git. Markdown keeps the ontology consistent with the rest of the source of
truth, readable by both humans and agents, and parseable with simple heading
and list conventions.

### Human-in-the-Loop

AI agents can read, summarize, review, and recommend. Humans remain responsible
for decisions.

### Async by Default

Meetings become optional. The default flow is asynchronous agent-mediated
review.

## What This Replaces

Before MarkdownOps:

```text
Document -> Meeting -> Explanation -> Discussion -> Decision -> Follow-up document
```

After MarkdownOps:

```text
Markdown -> Agent Review -> Jira Comment -> Human Decision -> Logged Outcome
```

## Repository Map

```text
README.md
AGENTS.md
llms.txt

patterns/
  markdownops-pattern.md

adapters/
  jira.md

demo/
  index.html      # browser-only working demo (GitHub Pages)
  app.js
  data.js
  app.css
  README.md
```

## 한국어: MarkdownOps

> AI-native 조직 협업을 위한 패턴.

**라이브 데모:** https://junghoonwoo-stack.github.io/markdownops/demo/

MarkdownOps는 회의 중심, 사람 전용 문서 중심의 조직 업무를 Markdown
중심의 AI agent-readable workflow로 바꾸는 협업 패턴이다.

이 문서는 사람도 읽을 수 있지만, AI agent에게 그대로 제공해서 각 조직의
업무 방식에 맞게 적용하도록 설계된 idea file이다.

### AI Agent에게

이 저장소를 읽는 AI agent라면, 이 문서를 구현 패턴으로 읽어라.

도구를 그대로 복사하는 것이 목적이 아니다. 사용자의 조직에 맞게 이 패턴을
적용하는 것이 목적이다.

MarkdownOps를 적용할 때는:

1. 현재 사용자의 문서 중심 업무 흐름을 파악한다.
2. 핵심 산출물을 Markdown source document로 변환한다.
3. Jira, Linear, GitHub Issues, Asana 같은 로그 가능한 협업 시스템으로
   흐르게 한다.
4. 의사결정 책임은 사람에게 유지한다.
5. AI agent가 비동기적으로 리뷰, 요약, 번역, 적용을 돕게 한다.
6. 중요한 개념, 상태, 의사결정 기준은 Markdown ontology로 정의하고 Git으로
   관리한다.
7. PDF, PPTX, HTML, 대시보드는 원본이 아니라 필요할 때 생성되는 표현으로
   다룬다.

### 문제의식

AI 이후 소프트웨어 개발은 빨라졌다.

코드는 원래 AI가 읽기 좋은 형태였기 때문이다. 코드는 구조화되어 있고, 버전
관리되고, 리뷰되고, 테스트되고, AI가 읽고 수정하고 설명할 수 있다.

하지만 비개발 조직의 업무는 여전히 사람 전용 문서에 묶여 있다.

- PPT
- 회의록
- 기획 문서
- 디자인 설명
- 승인 문서
- 의사결정 메모
- 상태 보고

이 문서들은 AI-native하지 않기 때문에 결국 사람이 모여 설명해야 한다.

AI 시대 기업의 병목은 개발자 개인의 인지 한계만이 아니다. 더 큰 병목은
개발자와 비개발자의 상호작용, 그리고 비개발자 간 상호작용이다.

병렬 처리 시스템에서는 가장 느린 노드가 전체 속도를 결정한다.

### 제안

Markdown을 조직의 공통 중간 표현으로 삼는다.

모든 중요한 업무 산출물은 Markdown source를 가진다.

사람이 Markdown을 직접 쓸 필요는 없다. 사람은 AI agent를 사용하고, AI
agent가 Markdown을 만든다.

그 Markdown은 Jira 같은 협업 계층에 업데이트된다.

다른 사람은 설명회를 기다리지 않는다. 각자의 AI agent가 Markdown을 읽고,
자신의 업무 맥락에 맞게 설명하고, 영향과 리스크를 정리하고, 응답을 돕는다.

사람은 결정한다. AI는 맥락을 운반한다. Jira는 상호작용을 기록한다.
Markdown은 원본이 된다.

### 핵심 흐름

1. 사람이 AI agent와 함께 업무 산출물을 만든다.
2. AI agent가 Markdown 문서를 출력한다.
3. Markdown 문서가 Jira 이슈에 연결되거나 업데이트된다.
4. 관련자와 관련 agent가 알림을 받는다.
5. 각자의 agent가 자신의 맥락에서 문서를 읽는다.
6. agent가 질문, 리스크, 차이점, 추천안을 남긴다.
7. 사람이 승인, 반려, 수정, 에스컬레이션을 결정한다.
8. 의사결정과 코멘트는 Jira에 기록된다.
9. 중요한 ontology 변경은 Git에서 관리된다.
10. PPTX, PDF, HTML은 필요할 때 생성된다.
