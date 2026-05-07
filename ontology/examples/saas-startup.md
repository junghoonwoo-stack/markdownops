# Ontology — SaaS startup (under ~50 people)

A trimmed ontology for an early-stage SaaS company with one product, one
engineering team, and no separate Legal function. Optimized for speed of
decision over completeness of process.

## Decision states

Three states instead of five. `changes-requested` and `blocked` are folded
back into `in-review` with comments — at this scale a state transition adds
ceremony without adding clarity.

| State | Definition |
|---|---|
| `draft` | Owner is composing. |
| `in-review` | At least one named reviewer is reading. Approval comes when the named approver leaves an `approve` comment. |
| `approved` | Decision logged. |

## Artifact types

Drop `software-prd` as a distinct artifact and merge it into `productization-proposal`.
Most product decisions and PRDs are made by the same person here. Drop
`decision-memo` — small-team decisions live in `productization-proposal` or
in the issue thread.

| Artifact | Reason |
|---|---|
| `sales-requirements` | Keep — early customers shape the roadmap. |
| `productization-proposal` | Keep, but include implementation sketch (no separate PRD). |
| `design-brief` | Keep when shipping major surface changes; skip for incremental. |
| `meeting-minutes` | Keep — used as input only. |

## Roles

Five roles collapse to three. Founders typically wear multiple roles.

| Role | Notes |
|---|---|
| `founder-ceo` | Stand-in for both Product and Executive. Approves productization. |
| `engineering` | Single team. Owns implementation feasibility. |
| `design-or-product` | Whoever is closest. One person often handles both lenses. |

## Agents and templates to adjust

- `agents/product-agent.md`: relax the "name a delivery team" rule — there is
  one team. Keep the "tie every claim to a capability or a flagged assumption"
  rule.
- `agents/engineering-agent.md`: drop "name the dependency team" — same team.
- `templates/productization-proposal.md`: add a `## Implementation sketch`
  section absorbing the merged PRD scope.

---

## 한국어

# 온톨로지 — SaaS 스타트업 (~50명 미만)

상품 1개, 엔지니어링 팀 1개, 별도 법무 기능이 없는 초기 SaaS 회사를 위한 슬림
온톨로지. 결정의 속도를 프로세스 완전성보다 우선.

## 의사결정 상태

5개 대신 3개. `changes-requested`와 `blocked`은 `in-review`에 코멘트로 흡수.
이 규모에선 상태 전이가 명료성을 더하기보다 의식만 추가한다.

| 상태 | 정의 |
|---|---|
| `draft` | 오너 작성 중. |
| `in-review` | 최소 한 명의 명명된 리뷰어가 읽는 중. 명명된 승인자가 `approve` 코멘트를 남기면 승인. |
| `approved` | 결정 로그. |

## 산출물 종류

`software-prd`를 별도 산출물에서 빼고 `productization-proposal`에 흡수. 이
규모에서 상품 결정과 PRD는 보통 같은 사람이 만든다. `decision-memo`도 빼기 —
작은 팀의 결정은 `productization-proposal`이나 이슈 스레드에서 처리.

| 산출물 | 이유 |
|---|---|
| `sales-requirements` | 유지 — 초기 고객이 로드맵을 만든다. |
| `productization-proposal` | 유지, 단 구현 스케치 포함 (별도 PRD 없음). |
| `design-brief` | 큰 표면 변경 시 유지. 점진적 개선엔 생략. |
| `meeting-minutes` | 유지 — 입력으로만 사용. |

## 역할

5개 → 3개로 축약. 창업자는 보통 여러 역할 겸임.

| 역할 | 노트 |
|---|---|
| `founder-ceo` | Product와 Executive 겸. 상품화 승인 권한. |
| `engineering` | 단일 팀. 구현 실현 가능성 책임. |
| `design-or-product` | 가까운 사람 누구든. 한 명이 두 렌즈 자주 겸임. |

## 조정해야 할 agent와 템플릿

- `agents/product-agent.md`: "전달 팀 명명" 룰 완화 — 팀 하나뿐. "모든 주장을
  자산 또는 표시된 가정에 연결"은 유지.
- `agents/engineering-agent.md`: "의존성 팀 명명" 제거 — 같은 팀.
- `templates/productization-proposal.md`: 흡수된 PRD 범위를 담을
  `## 구현 스케치` 섹션 추가.
