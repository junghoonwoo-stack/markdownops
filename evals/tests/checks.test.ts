import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkMetadata,
  checkRequiredSections,
  checkRequiredSectionsKr,
  checkLineBudget,
  hasKoreanSection,
  runAllChecks,
  summarize,
} from "../src/checks.js";
import { SPECS } from "../src/artifact-spec.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const example = (name: string) => resolve(HERE, "../examples", name);

async function load(name: string): Promise<string> {
  return readFile(example(name), "utf-8");
}

describe("hasKoreanSection", () => {
  it("returns true for an output with a Korean h2 marker", () => {
    expect(hasKoreanSection("foo\n\n## 한국어\nbar")).toBe(true);
  });
  it("returns true for a Korean artifact title", () => {
    expect(hasKoreanSection("# 영업요구조건서 — Test\n")).toBe(true);
  });
  it("returns false for an English-only artifact", async () => {
    const md = await load("sales-requirements.good.md");
    expect(hasKoreanSection(md)).toBe(false);
  });
});

describe("checkMetadata", () => {
  it("passes when all keys are present in head", async () => {
    const md = await load("sales-requirements.good.md");
    const r = checkMetadata(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(true);
  });
  it("fails when keys are missing", async () => {
    const md = await load("sales-requirements.bad.md");
    const r = checkMetadata(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(false);
    expect(r.details).toContain("Owner");
    expect(r.details).toContain("Status");
  });
});

describe("checkRequiredSections", () => {
  it("passes for the good example", async () => {
    const md = await load("sales-requirements.good.md");
    const r = checkRequiredSections(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(true);
  });
  it("fails when sections are missing", async () => {
    const md = await load("sales-requirements.bad.md");
    const r = checkRequiredSections(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(false);
    expect(r.details).toContain("## Next");
  });
});

describe("checkRequiredSectionsKr", () => {
  it("skips when no Korean section is present", async () => {
    const md = await load("sales-requirements.good.md");
    const r = checkRequiredSectionsKr(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(true);
    expect(r.details).toContain("skipped");
  });
});

describe("checkLineBudget", () => {
  it("passes for the good example (English-only, well within budget)", async () => {
    const md = await load("sales-requirements.good.md");
    const r = checkLineBudget(md, SPECS["sales-requirements"]);
    expect(r.passed).toBe(true);
  });
});

describe("runAllChecks", () => {
  it("good example -> all checks pass", async () => {
    const md = await load("sales-requirements.good.md");
    const results = runAllChecks("sales-requirements", md);
    const sum = summarize(results);
    expect(sum.passed).toBe(true);
    expect(sum.passedCount).toBe(sum.total);
  });

  it("bad example -> at least one check fails", async () => {
    const md = await load("sales-requirements.bad.md");
    const results = runAllChecks("sales-requirements", md);
    const sum = summarize(results);
    expect(sum.passed).toBe(false);
    const failed = results.filter((r) => !r.passed).map((r) => r.name);
    expect(failed).toContain("metadata");
    expect(failed).toContain("required-sections");
  });

  it("unknown spec -> single failure", () => {
    const results = runAllChecks("does-not-exist", "x");
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].name).toBe("spec");
  });
});

describe("specs registry", () => {
  it("registers a non-empty set of specs", () => {
    const ids = Object.keys(SPECS);
    expect(ids.length).toBeGreaterThan(0);
    for (const spec of Object.values(SPECS)) {
      expect(spec.requiredSections.length).toBeGreaterThan(0);
      expect(spec.requiredSectionsKr.length).toBe(spec.requiredSections.length);
      expect(spec.metadataKeys.length).toBeGreaterThan(0);
      expect(spec.maxLines).toBeGreaterThan(0);
    }
  });
});
