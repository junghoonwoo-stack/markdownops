# Ontology

Explicit definitions of the terms MarkdownOps uses internally — and starter
examples adopters can fork for their own organization.

The MarkdownOps pattern asks every adopter to make the following terms explicit
rather than letting them drift in human conversation:

- **Decision states** — what does "in review" mean, what transitions out of it
- **Artifact types** — what artifacts the workflow recognizes, who owns each
- **Roles** — who reviews what, what authority each has

This directory holds:

- The **default ontology** that the shipped agents and templates assume.
- A growing set of **examples** under `examples/` that adopters can copy and
  adapt — see `examples/README.md` for the index.

## Default ontology

| File | What it defines |
|---|---|
| [`decision-states.md`](decision-states.md) | The five states an artifact moves through. Maps 1:1 to `mdops:status:*` labels in every connector. |
| [`artifact-types.md`](artifact-types.md) | The artifact catalog — what each one is for, who produces it, who reviews it. Maps 1:1 to `templates/*.md` and `agents/*.md`. |
| [`roles.md`](roles.md) | Roles that participate in MarkdownOps reviews — what each role attends to and what authority it has. |

The shipped agents and templates were built against this default. If you fork
an example and change anything in the default ontology, expect to also adjust
the corresponding agent prompt or template.

## Conventions

- Every ontology file is bilingual: English first, Korean below.
- Definitions use heading + body, not nested YAML or tables, so AI agents and
  humans can both consume them with no intermediate parser.
- Each entry should be **falsifiable** — "approved" is defined by what
  transitions in and out of it, not by a vague description like "the artifact is
  ready."

## Adding a new entry

1. Decide which file the entry belongs to.
2. Use the existing entries' shape (heading, definition, transitions / scope).
3. If the new entry implies a behavior change for the agents or templates,
   update those at the same time.
4. If the new entry is org-specific, put it in `examples/<org-shape>.md`
   instead — keep the defaults stable.

---

## 한국어

# Ontology (온톨로지)

MarkdownOps가 내부적으로 쓰는 용어의 명시적 정의 — 그리고 도입자가 자기 조직에
맞게 가져갈 수 있는 시작 예시.

MarkdownOps 패턴은 모든 도입자가 다음 용어를 명시적으로 정의하길 요구한다 —
대화 속에서 미끄러지게 두지 말고:

- **의사결정 상태** — "리뷰중"이 무엇을 뜻하는지, 거기서 어디로 이동하는지
- **산출물 종류** — 워크플로우가 인식하는 산출물, 각 산출물의 오너
- **역할** — 누가 무엇을 리뷰하는지, 각 역할의 권한

이 디렉터리에는:

- 기본으로 함께 제공되는 agent·템플릿이 가정하는 **기본 온톨로지**.
- 도입자가 복사해서 변형할 수 있는 **예시**들 — `examples/README.md` 참조.

## 기본 온톨로지

| 파일 | 정의 |
|---|---|
| [`decision-states.md`](decision-states.md) | 산출물이 거치는 다섯 상태. 모든 커넥터의 `mdops:status:*` 라벨에 1:1 매핑. |
| [`artifact-types.md`](artifact-types.md) | 산출물 카탈로그 — 각 산출물이 무엇을 위한 것인지, 누가 만들고 누가 리뷰하는지. `templates/*.md`와 `agents/*.md`에 1:1 매핑. |
| [`roles.md`](roles.md) | MarkdownOps 리뷰에 참여하는 역할들 — 각 역할이 무엇을 본질로 하고 어떤 권한을 갖는지. |

기본으로 제공되는 agent와 템플릿은 이 기본 온톨로지를 전제로 만들어졌다. 예시를
포크해 기본 온톨로지를 바꾼다면, 해당 agent 프롬프트나 템플릿도 함께 조정해야
한다.

## 컨벤션

- 모든 온톨로지 파일은 이중 언어: 영문 먼저, 한국어 아래.
- 정의는 heading + 본문 형태. 중첩 YAML이나 표 대신 — agent와 사람이 모두
  중간 파서 없이 소비할 수 있게.
- 각 항목은 **반증 가능**해야 한다 — "approved"는 "산출물이 준비됨"이라는 모호한
  서술이 아니라, 어떤 입출력 전이로 정의되는지로 명세된다.

## 새 항목 추가

1. 어느 파일에 속하는지 결정.
2. 기존 항목의 모양(heading, 정의, 전이/범위)을 그대로.
3. 새 항목이 agent나 템플릿의 동작 변경을 함의한다면 동시에 갱신.
4. 조직 고유 항목이라면 `examples/<조직-형태>.md`에 — 기본은 안정적으로 유지.
