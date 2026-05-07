# Roles

The roles MarkdownOps reviews recognize by default. Each role corresponds to
an [agent](../agents/) that prepares context for the human in that role.

A role is **not** a job title. It is a *review lens*. One person can wear
multiple roles on different artifacts. A small team can have one person
covering Product and Design.

## Sales

What this role attends to: customer fit, pipeline impact, deal-level economics.

- **Produces**: `sales-requirements`
- **Reviews**: nothing in default flow (could review productization-proposal
  if the productization meaningfully changes the customer story).
- **Authority**: decline / pursue at the deal level. Cannot unilaterally
  approve scope or pricing.

## Product

What this role attends to: market segment, differentiation, pricing, scope vs
strategy.

- **Produces**: `productization-proposal`
- **Reviews**: `sales-requirements`, `software-prd`, `design-brief`
- **Authority**: approve productization scope.

## Engineering

What this role attends to: feasibility, capacity, SLO bar, security, dependency.

- **Produces**: `software-prd`
- **Reviews**: `productization-proposal`, `design-brief`
- **Authority**: approve PRD scope and sprint-zero entry. Has veto on infeasible
  scope (decision in review = `request-changes` or `block`, not "approve with caveat").

## Design

What this role attends to: audience, surfaces, design trade-offs, sprint scope.

- **Produces**: `design-brief`
- **Reviews**: `productization-proposal`, `software-prd`
- **Authority**: approve design scope. Speaks for the user.

## Legal & Compliance

What this role attends to: data regimes, licensing, contracts, disclosures, audit trails.

- **Produces**: structured reviews only — no first-class artifact in default flow.
- **Reviews**: any artifact with regulatory exposure.
- **Authority**: block on compliance grounds. Never `approve with caveat` —
  use `block` with a path to unblock.

## Executive

What this role attends to: prioritization, capital and capacity allocation,
unblocking external dependencies.

- **Produces**: executive briefs (one-page summaries via `executive-summarizer`).
- **Reviews**: surfaces and approves at the level above individual artifacts —
  e.g. quarterly portfolio decisions.
- **Authority**: prioritize, defer, reject at portfolio scope. Should not
  micro-approve PRDs and design briefs that have a primary role-owner.

## Choosing roles for a review

A reviewer agent's value is highest when its lens is the smallest one that
catches the missing concern. If multiple roles would say the same thing,
default to the more specific one (e.g. Engineering over Product if the concern
is feasibility).

---

## 한국어

# 역할 (Roles)

MarkdownOps 리뷰가 기본으로 인식하는 역할. 각 역할은 그 역할을 맡은 사람을 위해
맥락을 준비하는 [agent](../agents/)와 1:1 대응한다.

역할은 **직책이 아니다**. *리뷰 렌즈*다. 한 사람이 다른 산출물에서는 다른 역할을
맡을 수 있다. 작은 팀에서는 한 사람이 Product와 Design을 동시에 맡을 수 있다.

## Sales (영업)

본질로 보는 것: 고객 적합도, 파이프라인 영향, 딜 차원 경제성.

- **작성**: `sales-requirements`
- **리뷰**: 기본 흐름에서 없음 (상품화가 고객 스토리를 의미 있게 바꾼다면
  productization-proposal 리뷰 가능).
- **권한**: 딜 차원에서 거절/추진. 범위나 가격을 단독 승인 불가.

## Product (상품)

본질로 보는 것: 시장 세그먼트, 차별화, 가격, 범위 vs 전략.

- **작성**: `productization-proposal`
- **리뷰**: `sales-requirements`, `software-prd`, `design-brief`
- **권한**: 상품화 범위 승인.

## Engineering (엔지니어링)

본질로 보는 것: 실현 가능성, 용량, SLO 기준, 보안, 의존성.

- **작성**: `software-prd`
- **리뷰**: `productization-proposal`, `design-brief`
- **권한**: PRD 범위와 스프린트 제로 진입 승인. 실현 불가능한 범위에 대한 거부권
  (리뷰 결정 = `변경 요청` 또는 `보류`. "단서부 승인" 금지).

## Design (디자인)

본질로 보는 것: 사용자, 표면, 디자인 트레이드오프, 스프린트 범위.

- **작성**: `design-brief`
- **리뷰**: `productization-proposal`, `software-prd`
- **권한**: 디자인 범위 승인. 사용자를 대변.

## Legal & Compliance (법무·컴플라이언스)

본질로 보는 것: 데이터 규제, 라이선스, 계약, 공시, 감사 흔적.

- **작성**: 구조화된 리뷰만 — 기본 흐름에서 1급 산출물 없음.
- **리뷰**: 규제 노출이 있는 모든 산출물.
- **권한**: 컴플라이언스 근거로 보류. "단서부 승인" 절대 금지 —
  풀기 위한 경로와 함께 `보류`.

## Executive (경영진)

본질로 보는 것: 우선순위, 자본·인력 배분, 외부 의존성 해소.

- **작성**: 한 페이지 경영진 브리프 (`executive-summarizer`).
- **리뷰**: 개별 산출물 위 차원에서 승인 — 예: 분기 포트폴리오 결정.
- **권한**: 포트폴리오 차원에서 우선순위, 연기, 반려. 1급 오너가 있는 PRD나
  디자인 발의서를 마이크로 승인하지 않는 것이 좋다.

## 리뷰 역할 고르기

리뷰어 agent의 가치는 그 렌즈가 놓친 우려를 잡아낼 수 있는 가장 작은 렌즈일 때
가장 크다. 여러 역할이 같은 말을 한다면 더 구체적인 쪽을 기본으로 (예: 실현
가능성 우려라면 Product보다 Engineering).
