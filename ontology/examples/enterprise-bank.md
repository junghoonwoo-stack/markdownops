# Ontology — Enterprise bank (regulated, multi-jurisdictional)

A heavier ontology for a regulated financial institution. Adds compliance
gates, a Risk function, and a regulatory-filing-pending state. Optimized for
auditability and explicit regulatory accountability.

## Decision states

Six states. Add `regulatory-pending` between `in-review` and `approved` for
artifacts that require an external filing.

| State | Definition |
|---|---|
| `draft` | Owner composing. |
| `in-review` | Internal stakeholders + their agents reviewing. |
| `regulatory-pending` | Internal review passed; awaiting an external filing or regulatory acknowledgment. |
| `approved` | All gates cleared. |
| `changes-requested` | At least one reviewer (or the regulator) requested changes. |
| `blocked` | External dependency outside any reviewer's authority. |

## Artifact types

Add three artifacts that the default flow does not need; keep the rest.

| Artifact | Why bank-specific |
|---|---|
| `sales-requirements` | Keep. |
| `productization-proposal` | Keep. |
| `software-prd` | Keep. |
| `design-brief` | Keep. |
| `risk-assessment` | New. Required for any artifact touching customer money or non-public data. Owned by Risk. |
| `regulatory-filing-plan` | New. Lists which jurisdictions need notification or licensing. Owned by Legal. |
| `audit-trail-summary` | New. End-of-quarter rollup linking decisions to artifacts. Owned by Compliance. |

## Roles

Seven roles. The default `legal-reviewer` splits into Legal and Compliance,
and a Risk role is added.

| Role | Authority |
|---|---|
| `sales` | Same as default. |
| `product` | Same as default. |
| `engineering` | Same as default; adds a security review obligation on every PRD. |
| `design` | Same as default. |
| `legal` | Drafts `regulatory-filing-plan`. Reviews any contract-bearing artifact. |
| `compliance` | Reviews `audit-trail-summary`, KYC/AML implications, data-retention. |
| `risk` | Owns `risk-assessment`. Reviews PRDs touching customer money. |
| `executive` | Approves at the portfolio level. |

## Hard rules added

- Every artifact touching customer funds or non-public data must link a
  `risk-assessment` before it can leave `in-review`.
- `legal-reviewer` becomes two reviewers: legal and compliance. Both must
  approve, or one's `block` halts progress.
- `audit-trail-summary` is generated quarterly from approved artifacts; the
  reviewer agents are required to leave structured comments parseable into
  this rollup.

## Agents and templates to adjust

- New agents: `risk-agent.md`, `compliance-reviewer.md`. Split
  `legal-reviewer.md` into `legal-counsel.md` and `compliance-reviewer.md`.
- New templates: `templates/risk-assessment.md`,
  `templates/regulatory-filing-plan.md`, `templates/audit-trail-summary.md`.

---

## 한국어

# 온톨로지 — 대형 은행 (규제, 다국 관할)

규제 금융기관을 위한 무거운 온톨로지. 컴플라이언스 관문, Risk 기능, 규제 신고
대기 상태 추가. 감사 가능성과 명시적 규제 책임에 최적화.

## 의사결정 상태

6개. 외부 신고가 필요한 산출물을 위해 `in-review`와 `approved` 사이에
`regulatory-pending` 추가.

| 상태 | 정의 |
|---|---|
| `draft` | 오너 작성 중. |
| `in-review` | 내부 이해관계자 + 그들의 agent 리뷰 중. |
| `regulatory-pending` | 내부 리뷰 통과; 외부 신고 또는 규제 승인 대기. |
| `approved` | 모든 관문 통과. |
| `changes-requested` | 최소 한 리뷰어(또는 규제기관)가 변경 요청. |
| `blocked` | 어느 리뷰어 권한 밖의 외부 의존성. |

## 산출물 종류

기본 흐름에 없는 3개 추가. 나머지는 유지.

| 산출물 | 은행 특화 이유 |
|---|---|
| `sales-requirements` | 유지. |
| `productization-proposal` | 유지. |
| `software-prd` | 유지. |
| `design-brief` | 유지. |
| `risk-assessment` | 신규. 고객 자금이나 비공개 데이터를 다루는 모든 산출물에 필수. Risk가 오너. |
| `regulatory-filing-plan` | 신규. 어느 관할에 통지/라이선스가 필요한지 목록. Legal이 오너. |
| `audit-trail-summary` | 신규. 분기말 결정→산출물 롤업. Compliance가 오너. |

## 역할

7개. 기본의 `legal-reviewer`가 Legal과 Compliance로 분리되고 Risk 역할 추가.

| 역할 | 권한 |
|---|---|
| `sales` | 기본과 동일. |
| `product` | 기본과 동일. |
| `engineering` | 기본 + 모든 PRD에 보안 리뷰 의무. |
| `design` | 기본과 동일. |
| `legal` | `regulatory-filing-plan` 작성. 계약을 동반한 모든 산출물 리뷰. |
| `compliance` | `audit-trail-summary`, KYC/AML 함의, 데이터 보존 리뷰. |
| `risk` | `risk-assessment` 오너. 고객 자금 관련 PRD 리뷰. |
| `executive` | 포트폴리오 차원 승인. |

## 추가되는 하드 룰

- 고객 자금이나 비공개 데이터를 다루는 모든 산출물은 `risk-assessment`를 연결한
  뒤에야 `in-review`를 벗어날 수 있다.
- `legal-reviewer`가 legal과 compliance 둘로 나뉜다. 둘 다 승인 필수, 또는 한
  쪽의 `block`이 진행을 막는다.
- `audit-trail-summary`는 승인된 산출물에서 분기마다 생성된다. 리뷰어 agent는
  이 롤업으로 파싱 가능한 구조화 코멘트를 남겨야 한다.

## 조정해야 할 agent와 템플릿

- 신규 agent: `risk-agent.md`, `compliance-reviewer.md`. `legal-reviewer.md`를
  `legal-counsel.md`와 `compliance-reviewer.md`로 분리.
- 신규 템플릿: `templates/risk-assessment.md`,
  `templates/regulatory-filing-plan.md`, `templates/audit-trail-summary.md`.
