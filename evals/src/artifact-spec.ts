export interface ArtifactSpec {
  id: string;
  /** Required headings (e.g. "## Customer context"). Match case-sensitive. */
  requiredSections: string[];
  /** Korean equivalents, checked only if a Korean marker is present in the output. */
  requiredSectionsKr: string[];
  /** Metadata keys that must appear in `**<key>**` form near the top. */
  metadataKeys: string[];
  /** Line budget per language. Bilingual artifacts get 2.5× this allowance. */
  maxLines: number;
  /** Description shown by the CLI. */
  description: string;
}

export const SPECS: Record<string, ArtifactSpec> = {
  "sales-requirements": {
    id: "sales-requirements",
    description: "Sales requirements artifact (영업요구조건서) — produced by sales-agent.",
    requiredSections: [
      "## Customer context",
      "## What the customer asked for",
      "## Sales recommendation",
      "## Next",
    ],
    requiredSectionsKr: [
      "## 고객 맥락",
      "## 고객 요구사항",
      "## 영업 권고",
      "## 다음",
    ],
    metadataKeys: ["Owner", "Status", "Generated"],
    maxLines: 50,
  },
  "productization-proposal": {
    id: "productization-proposal",
    description: "Productization proposal (상품화 발의서) — produced by product-agent.",
    requiredSections: [
      "## Problem",
      "## Proposed product",
      "## Differentiation",
      "## Pricing model",
      "## Risks and asks",
      "## Decision sought",
    ],
    requiredSectionsKr: [
      "## 문제",
      "## 제안 상품",
      "## 차별화",
      "## 가격 모델",
      "## 리스크와 요청",
      "## 요청 의사결정",
    ],
    metadataKeys: ["Owner", "Status"],
    maxLines: 60,
  },
  "software-prd": {
    id: "software-prd",
    description: "Software PRD — produced by engineering-agent.",
    requiredSections: [
      "## Goal",
      "## Non-goals",
      "## Functional scope",
      "## SLOs",
      "## Open questions",
      "## Decision needed",
    ],
    requiredSectionsKr: [
      "## 목표",
      "## 범위 제외",
      "## 기능 범위",
      "## SLO",
      "## 미해결 질문",
      "## 필요한 의사결정",
    ],
    metadataKeys: ["Owner", "Status"],
    maxLines: 70,
  },
  "design-brief": {
    id: "design-brief",
    description: "Design brief (디자인 발의서) — produced by design-agent.",
    requiredSections: [
      "## Audience",
      "## Design principles",
      "## Surfaces",
      "## Open design questions",
      "## Next",
    ],
    requiredSectionsKr: [
      "## 사용자",
      "## 디자인 원칙",
      "## 표면",
      "## 미해결 디자인 질문",
      "## 다음",
    ],
    metadataKeys: ["Owner", "Status"],
    maxLines: 50,
  },
  "decision-memo": {
    id: "decision-memo",
    description: "Decision memo — produced by any decision-owner.",
    requiredSections: [
      "## Decision sought",
      "## Context",
      "## Options",
      "## Recommendation",
    ],
    requiredSectionsKr: [
      "## 요청 의사결정",
      "## 맥락",
      "## 옵션",
      "## 권고",
    ],
    metadataKeys: ["Owner", "Status"],
    maxLines: 40,
  },
};
