import { SPECS, type ArtifactSpec } from "./artifact-spec.js";

export interface CheckResult {
  name: string;
  passed: boolean;
  details?: string;
}

const KOREAN_MARKER = /(##\s*한국어|^# 영업요구조건서|^# 상품화 발의서|^# 디자인 발의서|^# 의사결정|^# 회의록|^# PRD —)/m;

export function hasKoreanSection(output: string): boolean {
  return KOREAN_MARKER.test(output);
}

export function checkMetadata(output: string, spec: ArtifactSpec): CheckResult {
  const head = output.split("\n").slice(0, 20).join("\n");
  const missing: string[] = [];
  for (const key of spec.metadataKeys) {
    const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    if (!new RegExp(`\\*\\*${escaped}\\*\\*`).test(head)) {
      missing.push(key);
    }
  }
  return {
    name: "metadata",
    passed: missing.length === 0,
    details:
      missing.length > 0
        ? `missing keys in head 20 lines: ${missing.join(", ")}`
        : undefined,
  };
}

export function checkRequiredSections(
  output: string,
  spec: ArtifactSpec
): CheckResult {
  const missing = spec.requiredSections.filter((s) => !output.includes(s));
  return {
    name: "required-sections",
    passed: missing.length === 0,
    details:
      missing.length > 0
        ? `missing English sections: ${missing.join(" | ")}`
        : undefined,
  };
}

export function checkRequiredSectionsKr(
  output: string,
  spec: ArtifactSpec
): CheckResult {
  if (!hasKoreanSection(output)) {
    return {
      name: "required-sections-kr",
      passed: true,
      details: "no Korean section detected — skipped",
    };
  }
  const missing = spec.requiredSectionsKr.filter((s) => !output.includes(s));
  return {
    name: "required-sections-kr",
    passed: missing.length === 0,
    details:
      missing.length > 0
        ? `missing Korean sections: ${missing.join(" | ")}`
        : undefined,
  };
}

export function checkLineBudget(
  output: string,
  spec: ArtifactSpec
): CheckResult {
  const total = output.split(/\r?\n/).length;
  const allowance = hasKoreanSection(output)
    ? Math.round(spec.maxLines * 2.5)
    : spec.maxLines;
  return {
    name: "line-budget",
    passed: total <= allowance,
    details: `output has ${total} lines, allowance ${allowance} (base ${spec.maxLines}${
      hasKoreanSection(output) ? ", bilingual ×2.5" : ""
    })`,
  };
}

export function runAllChecks(specId: string, output: string): CheckResult[] {
  const spec = SPECS[specId];
  if (!spec) {
    return [
      {
        name: "spec",
        passed: false,
        details: `unknown spec id: ${specId} (known: ${Object.keys(SPECS).join(", ")})`,
      },
    ];
  }
  return [
    checkMetadata(output, spec),
    checkRequiredSections(output, spec),
    checkRequiredSectionsKr(output, spec),
    checkLineBudget(output, spec),
  ];
}

export function summarize(results: CheckResult[]): {
  passed: boolean;
  passedCount: number;
  total: number;
} {
  const passedCount = results.filter((r) => r.passed).length;
  return {
    passed: passedCount === results.length,
    passedCount,
    total: results.length,
  };
}
