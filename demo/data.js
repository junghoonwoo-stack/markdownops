// MarkdownOps demo — scenario and recorded artifacts.
// All content is bilingual (en / ko). Edit freely; the UI re-reads on reload.

const SCENARIO = {
  title: {
    en: "ACME Trade — Cross-Border Instant Card",
    ko: "ACME 트레이드 — 해외 즉시결제 카드",
  },
  customer: {
    en: "ACME Trade Co. (annual revenue 800B KRW)",
    ko: "ACME 트레이드 (연 매출 8,000억 원)",
  },
  initialNeed: {
    en:
      "ACME Trade dispatches ~200 employees on overseas business trips each month. " +
      "Treasury reports two pain points with the current corporate card: (1) USD exchange settlement " +
      "takes 24–72 hours, blocking on-trip purchases; (2) bundled FX spread + foreign-transaction fees " +
      "average 2.8% of monthly volume. Estimated monthly transaction volume: 3.0B KRW (~$2.2M USD). " +
      "ACME wants real-time USD conversion at swipe, transparent rates with spread under 0.5%, " +
      "per-employee caps controllable by their treasury portal, and a CSV/SFTP feed into SAP.",
    ko:
      "ACME 트레이드는 매월 약 200명의 직원을 해외 출장에 파견합니다. 재무팀이 보고한 기존 법인 카드의 " +
      "주요 불편: (1) USD 환전 결제까지 24–72시간이 소요되어 출장 중 구매가 막힘. (2) FX 스프레드 + 해외이용 " +
      "수수료 합산 평균 2.8%로 월 거래액 대비 부담. 월 예상 거래액: 30억 원 (약 220만 USD). ACME 요구: 결제 " +
      "시점 실시간 USD 환전, 스프레드 0.5% 이하의 투명한 환율, ACME 재무 포털에서 직원별 한도 통제, SAP 경비 " +
      "파이프라인으로의 CSV/SFTP 자동 적재.",
  },
};

const REVIEWERS = [
  {
    id: "product",
    name: "Park Soo-jin",
    role: { en: "Product", ko: "상품" },
  },
  {
    id: "engineering",
    name: "Kim Min-ho",
    role: { en: "Engineering", ko: "엔지니어링" },
  },
  {
    id: "design",
    name: "Lee Hae-rin",
    role: { en: "Design", ko: "디자인" },
  },
  {
    id: "legal",
    name: "Choi Yun-seo",
    role: { en: "Legal & Compliance", ko: "법무·컴플라이언스" },
  },
];

const REVIEWS = {
  product: {
    decision: "approve",
    en: {
      summary:
        "ACME profile and pipeline match our enterprise FX expansion roadmap. CBIC scope as drafted is coherent.",
      concerns: [
        "Pricing model assumes FX engine cost remains < 0.15% — verify with Treasury.",
        "8,000 KRW/card monthly may be soft on enterprise ACVs > 1B — consider tiered pricing.",
      ],
      changes: ["None blocking sign-off."],
    },
    ko: {
      summary:
        "ACME 프로필과 파이프라인이 법인 FX 확장 로드맵과 부합. 발의서 범위 일관됨.",
      concerns: [
        "가격 모델은 FX 엔진 비용이 0.15% 미만 유지를 가정 — 재무와 검증 필요.",
        "ACV 10억 이상 법인에 카드당 월 8,000원은 약할 수 있음 — 티어 검토.",
      ],
      changes: ["승인을 막는 변경 없음."],
    },
  },
  engineering: {
    decision: "request-changes",
    en: {
      summary:
        "Real-time FX at corporate peak (3.5x retail) is unproven. Load-test gate required before commitment.",
      concerns: [
        "FX engine retail-peak p95 is 180ms; corporate-peak modeling unclear.",
        "Settlement reconciliation needs Visa/MC corporate-tier feed.",
        "Disputes flow ownership unresolved.",
      ],
      changes: [
        "Add a 'load-test gate' to the productization proposal: ship-green if FX p95 < 200ms at 3.5x retail.",
        "Engage Visa/MC partnership team this week.",
      ],
    },
    ko: {
      summary:
        "법인 피크(소매 3.5배)에서의 실시간 FX는 미검증. 약속 전에 부하 테스트 관문 필수.",
      concerns: [
        "FX 엔진 소매 피크 p95 180ms. 법인 피크 모델링 미정.",
        "정산 대사에 Visa/MC 법인 등급 피드 필요.",
        "분쟁 처리 오너십 미해결.",
      ],
      changes: [
        "상품화 발의서에 '부하 테스트 관문' 추가: 3.5배 소매 부하에서 FX p95 < 200ms 그린이면 출시.",
        "이번 주 Visa/MC 파트너십팀 컨택.",
      ],
    },
  },
  design: {
    decision: "approve",
    en: {
      summary:
        "Audience model is right. Treasury console deserves its own design sprint, not a side-deliverable.",
      concerns: [
        "Push notification at swipe must not confuse travelers in low-connectivity airports.",
        "Cap-edit inline vs modal is a real trade-off; needs prototype.",
      ],
      changes: ["None blocking; design sprint to start 2026-05-12."],
    },
    ko: {
      summary:
        "사용자 모델 적절. 재무 콘솔은 부속 산출물이 아닌 별도 디자인 스프린트가 필요.",
      concerns: [
        "결제 푸시 알림은 저연결 공항에서 사용자에게 혼란 없도록 설계 필수.",
        "한도 편집 인라인 vs 모달은 실제 트레이드오프 — 프로토타입 필요.",
      ],
      changes: ["승인을 막는 변경 없음. 디자인 스프린트 2026-05-12 시작."],
    },
  },
  legal: {
    decision: "request-changes",
    en: {
      summary:
        "Domestic license adequate for v1 (USD/KRW). Multi-currency expansion to v1.1 will require new filings.",
      concerns: [
        "Client-side cap storage could be argued as PI under PIPA — must be server-side.",
        "v1.1 EUR/GBP needs MAS or FCA equivalence work — typically 8–12 weeks.",
      ],
      changes: [
        "Move cap configuration to server-side storage only — confirm in PRD.",
        "Add a 'license filing' milestone to productization proposal for v1.1.",
      ],
    },
    ko: {
      summary:
        "v1(USD/KRW)에는 국내 라이선스 충분. v1.1 다통화 확장은 신규 신고 필요.",
      concerns: [
        "직원별 한도의 클라이언트 측 저장은 PIPA상 PI 해석 여지 — 서버 측 저장 필수.",
        "v1.1 EUR/GBP는 MAS 또는 FCA 동등성 검토 필요 — 통상 8–12주.",
      ],
      changes: [
        "한도 구성 저장을 서버 측 전용으로 변경 — PRD에 명시.",
        "상품화 발의서에 v1.1 '라이선스 신고' 마일스톤 추가.",
      ],
    },
  },
};

const ARTIFACTS = {
  "sales-requirements.md": {
    label: { en: "Sales Requirements", ko: "영업요구조건서" },
    role: "sales",
    en: `# Sales Requirements — ACME Trade Cross-Border Card

- **Customer**: ACME Trade Co. (annual revenue 800B KRW)
- **Owner**: Sales — Han Ji-woo
- **Status**: in-review
- **Generated**: 2026-05-07
- **Linked issue**: BANK-1842

## Customer context

ACME Trade dispatches ~200 employees on overseas business trips each month.
Their treasury reports two recurring pain points with current corporate cards:

1. USD exchange settlement takes 24–72 hours, blocking on-trip purchases.
2. Bundled FX spread plus foreign-transaction fees average **2.8%** of monthly volume.

Estimated monthly transaction volume: **3.0B KRW (~$2.2M USD)**.

## What ACME asked for

- Real-time USD conversion at point of sale.
- Transparent FX rate, target spread under **0.5%**.
- Per-employee spending caps controllable by ACME's treasury portal.
- Transaction logs feeding their SAP expense pipeline (CSV/SFTP).

## Sales recommendation

Pursue. ACME is reference-class for the corporate travel segment. A successful
deployment unlocks an estimated 6–8 similar accounts already on our pipeline.
Key risk: FX licensing and per-transaction settlement cost — needs Engineering
and Legal review.

## Next

Route to Product. Request productization proposal within 2 business days.`,
    ko: `# 영업요구조건서 — ACME 트레이드 해외 결제 카드

- **고객**: ACME 트레이드 (연 매출 8,000억 원)
- **담당**: 영업 — 한지우
- **상태**: 리뷰중
- **작성일**: 2026-05-07
- **연결 이슈**: BANK-1842

## 고객 맥락

ACME 트레이드는 매월 약 200명의 직원을 해외 출장에 파견한다. 재무팀이 보고한 기존
법인 카드의 주요 불편 두 가지:

1. USD 환전 결제까지 24–72시간 소요 — 출장 중 구매가 막힘.
2. FX 스프레드 + 해외이용 수수료 합산 평균 **2.8%** — 월 거래액 대비 부담.

월 예상 거래액: **30억 원 (약 220만 USD)**.

## ACME 요구사항

- POS 시점의 실시간 USD 환전.
- 투명한 환율, 스프레드 **0.5% 이하** 목표.
- 직원별 한도를 ACME 재무 포털에서 통제.
- SAP 경비 파이프라인으로 거래 로그 자동 적재 (CSV/SFTP).

## 영업 권고

진행. ACME는 법인 해외 출장 세그먼트의 레퍼런스 케이스. 성공 시 파이프라인의
유사 6–8개 계정 확보 기대. 핵심 리스크: 외환 라이선스와 거래당 정산 비용 —
엔지니어링·법무 리뷰 필요.

## 다음

상품팀으로 라우팅. 영업일 2일 내 상품화 발의서 요청.`,
  },
  "productization-proposal.md": {
    label: { en: "Productization Proposal", ko: "상품화 발의서" },
    role: "product",
    en: `# Productization Proposal — Cross-Border Instant Card (CBIC-1)

- **Owner**: Product — Park Soo-jin
- **Anchor customer**: ACME Trade (BANK-1842)
- **Status**: in-review
- **Linked**: sales-requirements.md, software-prd.md (draft), design-brief.md (draft)

## Problem

Corporate travel cards in market do not settle FX at point of sale. Spread + fee
burden is opaque, averaging 2.8% in the corporate segment. Treasury teams cannot
enforce per-trip caps in real time.

## Proposed product

CBIC — Cross-Border Instant Card. A corporate card product that:

- Settles FX live at swipe using our internal FX engine (live for retail since 2024-Q3).
- Exposes a treasury console (web) for per-employee caps, geo rules, SAP-ready exports.
- Targets all-in cost under **0.5%** (FX spread 0.3% + fee 0.2%).

## Differentiation

| Competitor | All-in cost | Real-time FX | Treasury console |
|---|---|---|---|
| Bank A Travel Pro | 2.6% | No | Limited |
| Fintech B Card | 1.4% | Partial | Yes |
| **CBIC (proposed)** | **0.5%** | **Yes** | **Yes** |

## Pricing model

- Issuance: free for accounts above 50 cards.
- Monthly per-card fee: 8,000 KRW.
- FX revenue: 0.3% spread.

## Risks and asks

- Engineering: confirm FX engine can carry corporate volume (peak 3.5x retail).
- Legal: validate corporate FX licensing for v1.1 (EUR/GBP).
- Design: define treasury console IA — separate workstream.

## Decision sought

Approve scope as a Tier-1 initiative for Q3 2026. Greenlight PRD and design
brief in parallel.`,
    ko: `# 상품화 발의서 — 해외 즉시결제 카드 (CBIC-1)

- **담당**: 상품 — 박수진
- **앵커 고객**: ACME 트레이드 (BANK-1842)
- **상태**: 리뷰중
- **연결**: 영업요구조건서, PRD(초안), 디자인 발의서(초안)

## 문제

시장의 법인 해외 출장 카드는 POS 시점에 FX가 정산되지 않는다. 스프레드+수수료
부담이 불투명하며 법인 평균 2.8%. 재무팀이 실시간으로 출장 한도를 강제할 수단도
없다.

## 제안 상품

CBIC — Cross-Border Instant Card. 다음을 갖춘 법인 카드:

- 결제 시점 실시간 FX 정산 (2024-Q3부터 운영 중인 사내 FX 엔진 활용).
- 직원별 한도/지역 규칙/SAP 내보내기를 위한 재무 콘솔(웹).
- 종합 비용 **0.5% 이하** 목표 (FX 스프레드 0.3% + 수수료 0.2%).

## 차별화

| 경쟁사 | 종합 비용 | 실시간 FX | 재무 콘솔 |
|---|---|---|---|
| A뱅크 트래블프로 | 2.6% | 없음 | 제한적 |
| B핀테크 카드 | 1.4% | 부분 | 있음 |
| **CBIC (제안)** | **0.5%** | **있음** | **있음** |

## 가격 모델

- 발급: 50카드 이상 계정 무상.
- 월 카드당 수수료: 8,000원.
- FX 수익: 0.3% 스프레드.

## 리스크와 요청

- 엔지니어링: 법인 거래량(피크 시 소매 대비 3.5배) 수용 가능 여부 확인.
- 법무: v1.1(EUR/GBP) 법인 외환 라이선스 검증.
- 디자인: 재무 콘솔 IA — 별도 트랙.

## 요청 의사결정

2026 Q3 Tier-1 이니셔티브로 범위 승인. PRD와 디자인 발의서 병행 추진 승인.`,
  },
  "software-prd.md": {
    label: { en: "Software PRD", ko: "소프트웨어 PRD" },
    role: "engineering",
    en: `# PRD — CBIC Card Issuance and Real-time FX

- **Owner**: Engineering — Kim Min-ho
- **Linked**: productization-proposal.md (CBIC-1)
- **Status**: draft

## Goal

Ship a card product with real-time FX settlement at POS, server-side per-card
caps, and treasury controls — by 2026-Q3.

## Non-goals

- Multi-currency beyond USD/KRW in v1 (EUR/GBP in v1.1).
- Personal accounts (corporate-only).

## Functional scope

1. Card issuance pipeline integrated with existing corporate KYC.
2. POS authorization flow with sub-200ms FX rate quote from internal FX engine.
3. Treasury console:
   - per-employee daily/monthly caps (server-side storage)
   - geo rules (allow/deny by country)
   - real-time transaction stream
   - scheduled SAP export (SFTP, CSV, daily 06:00 KST)
4. Settlement pipeline with daily reconciliation against FX engine and Visa/MC.

## SLOs

- Authorization p95 latency: 380ms (incl. FX quote).
- Treasury console availability: 99.9% monthly.
- SAP export job: complete by 06:30 KST (window 06:00–06:30).

## Open questions

- FX engine capacity at projected 3.5x retail peak — load test required.
- Hold/release semantics for declined post-auth (currency edge cases).
- Disputes flow ownership (CS team vs Treasury console).

## Decision needed

Approve to enter design-and-build. Target sprint zero: 2026-05-19.`,
    ko: `# PRD — CBIC 카드 발급 및 실시간 FX

- **담당**: 엔지니어링 — 김민호
- **연결**: 상품화 발의서 (CBIC-1)
- **상태**: 초안

## 목표

POS 시점 실시간 FX 정산, 서버 측 카드별 한도, 재무측 통제 기능을 갖춘 카드 상품을
2026 Q3에 출시.

## 범위 제외

- v1은 USD/KRW만 (EUR/GBP는 v1.1).
- 개인 계정 (법인 전용).

## 기능 범위

1. 기존 법인 KYC와 통합된 카드 발급 파이프라인.
2. 사내 FX 엔진에서 200ms 이하로 시세를 받아오는 POS 승인 흐름.
3. 재무 콘솔:
   - 직원별 일/월 한도 (서버 측 저장)
   - 국가별 허용/차단 규칙
   - 실시간 거래 스트림
   - SAP 정기 내보내기 (SFTP, CSV, 매일 06:00 KST)
4. FX 엔진과 Visa/MC 네트워크 대비 일일 정산·대사 파이프라인.

## SLO

- 승인 p95 지연: 380ms (FX 견적 포함).
- 재무 콘솔 가용성: 월 99.9%.
- SAP 내보내기 잡: 06:30 KST 까지 완료 (윈도우 06:00–06:30).

## 미해결 질문

- 예상 피크(소매 3.5배)에서 FX 엔진 용량 — 부하 테스트 필요.
- 사후 거절 시 보유/해제 시맨틱 (통화 엣지 케이스).
- 분쟁 처리 오너십 (CS팀 vs 재무 콘솔).

## 필요한 의사결정

설계·구축 진입 승인. 스프린트 제로 목표: 2026-05-19.`,
  },
  "design-brief.md": {
    label: { en: "Design Brief", ko: "디자인 발의서" },
    role: "design",
    en: `# Design Brief — CBIC Treasury Console + Card UX

- **Owner**: Design — Lee Hae-rin
- **Linked**: productization-proposal.md, software-prd.md
- **Status**: draft

## Audience

- **Primary**: corporate treasury operators (1–4 per account).
- **Secondary**: traveling employees using the CBIC card and mobile statement.
- **Tertiary**: ACME's expense reviewer (occasional, monthly).

## Design principles

1. **Treasury operators value control without latency.** Default to inline edits;
   avoid modal-confirmation pyramids.
2. **Travelers value clarity at the moment of swipe.** A push notification must
   show: amount in USD, amount in KRW, FX rate used, remaining daily cap.
3. **Reviewers value reconciliation.** Statement views must align 1:1 with SAP
   export columns.

## Surfaces

| Surface | Audience | v1 status |
|---|---|---|
| Treasury web console | Operators | required |
| iOS / Android push & in-app statement | Travelers | required |
| SAP CSV export | Reviewers | data-only |
| Public marketing page | Sales motion | required |

## Open design questions

- Cap-edit affordance: inline vs side-panel.
- Geo rule UX: per-country switches vs region templates.
- Dispute initiation: where it lives without colliding with CS.

## Next

Two-week design sprint. Deliverables: treasury console IA, mobile push spec,
statement v1, dispute flow.`,
    ko: `# 디자인 발의서 — CBIC 재무 콘솔 + 카드 UX

- **담당**: 디자인 — 이해린
- **연결**: 상품화 발의서, PRD
- **상태**: 초안

## 사용자

- **주**: 법인 재무 운영자 (계정당 1–4명).
- **부**: CBIC 카드를 쓰며 모바일 명세서를 보는 출장 직원.
- **간헐**: ACME의 경비 리뷰어 (월 단위).

## 디자인 원칙

1. **재무 운영자는 지연 없는 통제를 원한다.** 기본은 인라인 편집.
   모달 확인 피라미드 지양.
2. **출장자는 결제 순간의 명확함을 원한다.** 푸시 알림에는 USD 금액,
   KRW 환산액, 적용 환율, 일 한도 잔액이 동시에 보여야 한다.
3. **리뷰어는 대사를 원한다.** 명세서 뷰는 SAP 내보내기 컬럼과 1:1로 맞춘다.

## 표면

| 표면 | 사용자 | v1 상태 |
|---|---|---|
| 재무 웹 콘솔 | 운영자 | 필수 |
| iOS / Android 푸시·인앱 명세서 | 출장자 | 필수 |
| SAP CSV 내보내기 | 리뷰어 | 데이터만 |
| 공식 마케팅 페이지 | 영업 활동 | 필수 |

## 미해결 디자인 질문

- 한도 편집: 인라인 vs 사이드 패널.
- 지역 규칙: 국가별 스위치 vs 지역 템플릿.
- 분쟁 시작 위치: CS와 충돌하지 않게.

## 다음

2주 디자인 스프린트. 산출물: 재무 콘솔 IA, 모바일 푸시 스펙, 명세서 v1,
분쟁 흐름.`,
  },
};

const STEPS = [
  {
    id: "capture",
    title: { en: "1. Capture sales need", ko: "1. 영업 요구사항 캡처" },
    desc: {
      en:
        "A sales rep types the customer ask in plain language. The Sales Agent drafts " +
        "the formal Markdown sales-requirements artifact.",
      ko:
        "영업 담당이 고객의 요구를 자연어로 입력합니다. Sales Agent가 정식 Markdown " +
        "영업요구조건서를 작성합니다.",
    },
  },
  {
    id: "route",
    title: { en: "2. Route to coordination layer", ko: "2. 협업 레이어로 라우팅" },
    desc: {
      en:
        "An issue is created on the coordination board (Jira-equivalent). Stakeholder agents " +
        "for Product, Engineering, Design, and Legal are notified.",
      ko:
        "협업 보드(Jira 등)에 이슈가 생성됩니다. 상품·엔지니어링·디자인·법무 담당과 " +
        "각자의 agent에게 알림이 갑니다.",
    },
  },
  {
    id: "reviews",
    title: { en: "3. Async agent reviews", ko: "3. 비동기 agent 리뷰" },
    desc: {
      en:
        "Each stakeholder's agent reads the artifact in their own context and posts a " +
        "structured review to the coordination layer. No meeting required.",
      ko:
        "각 이해관계자의 agent가 자기 맥락에서 산출물을 읽고 협업 레이어에 구조화된 " +
        "리뷰를 남깁니다. 회의 불필요.",
    },
  },
  {
    id: "decide",
    title: { en: "4. Human decision", ko: "4. 사람의 의사결정" },
    desc: {
      en:
        "Humans remain accountable. Read the agents' reviews and click approve or " +
        "request-changes for each. Decisions log to the coordination layer.",
      ko:
        "의사결정 책임은 사람에게 있습니다. agent 리뷰를 읽고 각 항목에 승인 또는 변경 " +
        "요청을 클릭합니다. 결정은 협업 레이어에 로그됩니다.",
    },
  },
  {
    id: "cascade",
    title: { en: "5. Cascade downstream artifacts", ko: "5. 하류 산출물 연쇄 생성" },
    desc: {
      en:
        "Once approved, downstream agents draft the productization proposal, software PRD, " +
        "and design brief — all linked to the original sales requirements.",
      ko:
        "승인되면 하류 agent들이 상품화 발의서, 소프트웨어 PRD, 디자인 발의서를 " +
        "각각 작성합니다 — 모두 영업요구조건서에 연결됩니다.",
    },
  },
  {
    id: "recap",
    title: { en: "6. Recap", ko: "6. 정리" },
    desc: {
      en:
        "Four Markdown artifacts. One coordination thread. Decisions logged. " +
        "PDF / PPTX / dashboards can be generated on demand from these sources.",
      ko:
        "Markdown 산출물 4개. 협업 스레드 하나. 결정은 모두 로그. 필요 시 PDF / PPTX / " +
        "대시보드를 이 source로부터 생성합니다.",
    },
  },
];

const AGENT_PROMPTS = {
  sales:
    "You are the Sales Agent in a MarkdownOps workflow. Given a sales rep's free-text " +
    "description of a customer need, produce a complete sales-requirements.md artifact in " +
    "Markdown. Include: customer context, what they asked for, sales recommendation, next " +
    "step. Keep under 40 lines. Match the language of the input.",
  product:
    "You are the Product Agent. Given a sales-requirements.md artifact, draft a " +
    "productization-proposal.md (problem, proposed product, differentiation table, pricing, " +
    "risks, decision sought). Match the input's language. Keep under 50 lines.",
  engineering:
    "You are the Engineering Agent. Given a productization-proposal.md, draft a " +
    "software-prd.md (goal, non-goals, functional scope, SLOs, open questions, decision " +
    "needed). Match the input's language. Keep under 50 lines.",
  design:
    "You are the Design Agent. Given a productization-proposal.md and software-prd.md, " +
    "draft a design-brief.md (audience, principles, surfaces, open questions, next). " +
    "Match the input's language. Keep under 50 lines.",
};
