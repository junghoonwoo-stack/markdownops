# Artifact types

The artifacts MarkdownOps recognizes by default. Each one ships with a
[template](../templates/) and an [agent](../agents/) that knows how to draft
or review it.

## sales-requirements

A formal capture of a customer need, written by Sales.

- **Produced by**: `sales-agent`
- **Reviewed by**: `product-agent` (primary), legal where regulatory exposure is high
- **Template**: `templates/sales-requirements.md`
- **Stops being relevant when**: a productization proposal supersedes it, or
  the deal is declined.

## productization-proposal

The market-level case for turning the customer need into a shipped product.

- **Produced by**: `product-agent`
- **Reviewed by**: `engineering-agent`, `design-agent`, `legal-reviewer`
- **Template**: `templates/productization-proposal.md`
- **Approves what**: scope, anchor customer, decision-grade pricing model.
- **Does NOT approve**: implementation specifics — those belong in the PRD.

## software-prd

The implementation contract between Product, Engineering, and Design.

- **Produced by**: `engineering-agent`
- **Reviewed by**: `product-agent`, `design-agent`
- **Template**: `templates/software-prd.md`
- **Approves what**: scope, SLOs, sprint-zero readiness.
- **Hard rule**: every SLO has a number and a window; every open question has
  a named owner.

## design-brief

The audience-and-surfaces document that frames a focused design sprint.

- **Produced by**: `design-agent`
- **Reviewed by**: `product-agent`, `engineering-agent`
- **Template**: `templates/design-brief.md`
- **Approves what**: principles, surface scope, sprint kickoff.

## decision-memo

A standalone decision that doesn't belong in any of the artifact types above —
e.g. choosing between two vendors, retiring a legacy system, hiring decisions.

- **Produced by**: any decision-owner
- **Reviewed by**: stakeholders named in the memo
- **Template**: `templates/decision-memo.md`
- **Approves what**: the chosen option, with explicit out-of-scope.

## meeting-minutes

Used as input to other artifacts, not a standalone deliverable. Useful when a
synchronous meeting was unavoidable (judgment, negotiation, escalation).

- **Produced by**: any participant
- **Reviewed by**: any participant (for accuracy)
- **Template**: `templates/meeting-minutes.md`
- **Hard rule**: lists which downstream artifacts should pick up the
  meeting's decisions and disagreements.

---

## 한국어

# 산출물 종류

MarkdownOps가 기본으로 인식하는 산출물. 각 산출물에는 [템플릿](../templates/)과
[agent](../agents/)가 함께 제공된다.

## sales-requirements (영업요구조건서)

영업이 작성하는, 고객 요구의 정식 기록.

- **작성**: `sales-agent`
- **리뷰**: `product-agent` (주), 규제 노출이 높을 때 법무
- **템플릿**: `templates/sales-requirements.md`
- **종료 조건**: 상품화 발의서가 대체하거나 딜이 취소될 때.

## productization-proposal (상품화 발의서)

고객 요구를 출시 가능한 상품으로 옮기기 위한 시장 차원의 케이스.

- **작성**: `product-agent`
- **리뷰**: `engineering-agent`, `design-agent`, `legal-reviewer`
- **템플릿**: `templates/productization-proposal.md`
- **승인**: 범위, 앵커 고객, 결정 가능한 가격 모델.
- **미승인**: 구현 세부 — PRD의 영역.

## software-prd (소프트웨어 PRD)

상품·엔지니어링·디자인 사이의 구현 계약.

- **작성**: `engineering-agent`
- **리뷰**: `product-agent`, `design-agent`
- **템플릿**: `templates/software-prd.md`
- **승인**: 범위, SLO, 스프린트 제로 준비도.
- **하드 룰**: 모든 SLO는 숫자와 윈도우가 있다. 모든 미해결 질문은 책임자가 있다.

## design-brief (디자인 발의서)

집중된 디자인 스프린트를 프레이밍하는 사용자/표면 문서.

- **작성**: `design-agent`
- **리뷰**: `product-agent`, `engineering-agent`
- **템플릿**: `templates/design-brief.md`
- **승인**: 원칙, 표면 범위, 스프린트 킥오프.

## decision-memo (의사결정 메모)

위 산출물에 속하지 않는 단독 의사결정 — 예: 두 벤더 선택, 레거시 시스템 폐지,
채용 결정.

- **작성**: 결정 오너 누구든
- **리뷰**: 메모에 명명된 이해관계자
- **템플릿**: `templates/decision-memo.md`
- **승인**: 선택된 옵션, 명시적 범위 외 항목 포함.

## meeting-minutes (회의록)

다른 산출물의 입력으로 쓰이고, 단독 deliverable은 아니다. 동시 회의가 불가피했을
때 (판단·협상·에스컬레이션) 유용.

- **작성**: 참석자 누구든
- **리뷰**: 참석자 누구든 (정확성 검증)
- **템플릿**: `templates/meeting-minutes.md`
- **하드 룰**: 회의의 결정과 이견을 어느 하류 산출물이 반영해야 하는지 명시.
