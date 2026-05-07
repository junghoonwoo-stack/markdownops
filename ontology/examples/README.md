# Ontology examples

Starter ontologies for adopters who want to fork rather than start from
scratch. Each example tunes the [default ontology](../) to one organizational
shape — different states, different roles, different artifact catalog.

## How to use

1. Pick the shape that's closest to your organization.
2. Copy its three files (or the whole directory) into your fork's `ontology/`.
3. Diff against the defaults to see exactly what changed and why.
4. Update the agents and templates that depend on the changed entries.

## Available examples

| Example | Best fit for |
|---|---|
| [`saas-startup.md`](saas-startup.md) | <50-person SaaS startup, single product, one engineering team |
| [`enterprise-bank.md`](enterprise-bank.md) | Large regulated organization with formal compliance gates |
| [`design-agency.md`](design-agency.md) | Project-shop or agency where the deliverable is the design itself |

## Adding a new example

1. Pick a name for the org shape (e.g. `government-agency.md`,
   `research-lab.md`).
2. Inside, document — for that shape — the deltas from the defaults:
   - Which decision states are renamed, added, or removed?
   - Which artifact types are added or dropped?
   - Which roles look different (renamed, merged, split)?
3. Add a row to the table above with one-line "best fit for".
4. Bilingual — English first, Korean below.

---

## 한국어

# 온톨로지 예시

기본 온톨로지를 처음부터 만들지 않고 포크해서 출발하고 싶은 도입자를 위한 시작
온톨로지. 각 예시는 [기본 온톨로지](../)를 한 조직 형태에 맞게 튜닝한다 —
다른 상태, 다른 역할, 다른 산출물 카탈로그.

## 사용 방법

1. 자기 조직에 가장 가까운 형태 선택.
2. 그 세 파일을 포크의 `ontology/`에 복사 (또는 디렉터리 전체).
3. 기본과 diff 해서 무엇이 왜 바뀌었는지 확인.
4. 바뀐 항목에 의존하는 agent와 템플릿 갱신.

## 수록 예시

| 예시 | 적합 |
|---|---|
| [`saas-startup.md`](saas-startup.md) | 50명 미만 SaaS 스타트업, 단일 상품, 엔지니어링 팀 1개 |
| [`enterprise-bank.md`](enterprise-bank.md) | 정식 컴플라이언스 관문이 있는 규제 산업 대기업 |
| [`design-agency.md`](design-agency.md) | 디자인 자체가 산출물인 에이전시/프로젝트 샵 |

## 새 예시 추가

1. 조직 형태 이름 선택 (예: `government-agency.md`, `research-lab.md`).
2. 그 형태에 맞춰 기본과의 차이 기술:
   - 어떤 의사결정 상태가 이름 바뀌고/추가되고/제거되는가?
   - 어떤 산출물이 추가되고/빠지는가?
   - 어떤 역할이 다른가 (이름 바뀜/합쳐짐/분리)?
3. 위 표에 한 줄 "적합" 추가.
4. 이중 언어 — 영문 먼저, 한국어 아래.
