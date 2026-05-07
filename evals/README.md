# evals

Automated checks for MarkdownOps agent outputs — both deterministic structural
checks (run in CI without any API key) and an optional LLM-as-judge stage for
quality scoring.

## Why this exists

The [agents/](../agents/) directory ships LLM-agnostic system prompts. Whether
those prompts produce *good* artifacts depends on the model behind them, the
inputs they're handed, and how careful the agent definition is. The evals here
let you:

- Verify a candidate output (from any LLM) against the artifact's structural
  contract — required sections, metadata block, line budget, bilingual symmetry.
- Catch regressions when an agent prompt is edited.
- Optionally score quality with another Claude call as a "judge" — useful when
  iterating on a prompt.

## Install and run

```sh
cd evals
npm install
npm test               # runs the deterministic checks against examples/
```

To run the CLI against your own artifact:

```sh
npm run eval -- --spec sales-requirements --file path/to/output.md
```

To run the LLM-judge stage (requires `ANTHROPIC_API_KEY`):

```sh
export ANTHROPIC_API_KEY=sk-...
npm run eval -- --spec sales-requirements --file path/to/output.md --judge
```

## What's checked

For each artifact type with a registered spec, the following deterministic
checks run:

| Check | What it verifies |
|---|---|
| `metadata` | The metadata block at the top contains the required `**Owner**`, `**Status**`, etc. keys. |
| `required-sections` | All English required headings (e.g. `## Customer context`) are present. |
| `required-sections-kr` | If a Korean section marker is present, all Korean required headings are present too. |
| `line-budget` | The output respects the artifact's line budget (allowing 2.5× for fully-bilingual artifacts). |

The LLM-judge stage (when enabled) asks Claude to rate the output on:
- Coverage of input information (1-5)
- Specificity vs. corporate hedging (1-5)
- Adherence to the agent's hard rules (1-5)

## Adding a new spec

1. Edit `src/artifact-spec.ts` and add an entry to `SPECS`.
2. Add a known-good example at `examples/<spec-id>.good.md`.
3. Optionally add a `examples/<spec-id>.bad.md` that deliberately violates one
   check, plus a corresponding test in `tests/checks.test.ts`.
4. Re-run `npm test`.

---

## 한국어

# evals

MarkdownOps agent 출력을 자동 평가 — API key 없이 CI에서 돌리는 결정적
구조 검사 + 선택적인 LLM-as-judge 품질 채점.

## 존재 이유

[agents/](../agents/)는 LLM-agnostic 시스템 프롬프트를 제공한다. 그 프롬프트가
실제로 *좋은* 산출물을 만드는지는 뒤의 모델, 입력, agent 정의의 세심함에
따라 다르다. evals는 다음을 가능하게 한다:

- 후보 출력(어떤 LLM이든)을 산출물의 구조 계약과 대조 — 필수 섹션, 메타데이터
  블록, 줄 예산, 이중 언어 대칭.
- agent 프롬프트 수정 시 회귀 탐지.
- 프롬프트 반복 시 다른 Claude 호출로 품질 점수화 (LLM-as-judge).

## 설치와 실행

```sh
cd evals
npm install
npm test               # examples/에 대해 결정적 검사
```

자기 산출물에 대해 CLI 실행:

```sh
npm run eval -- --spec sales-requirements --file path/to/output.md
```

LLM-judge 단계 (`ANTHROPIC_API_KEY` 필요):

```sh
export ANTHROPIC_API_KEY=sk-...
npm run eval -- --spec sales-requirements --file path/to/output.md --judge
```

## 검사 항목

각 등록된 spec에 대해 다음이 결정적으로 검사된다:

| 검사 | 내용 |
|---|---|
| `metadata` | 상단 메타데이터 블록에 필수 키(`**Owner**`, `**Status**` 등) 존재. |
| `required-sections` | 영문 필수 헤딩 (`## Customer context` 등) 모두 존재. |
| `required-sections-kr` | 한국어 마커가 있으면 한국어 필수 헤딩도 모두 존재. |
| `line-budget` | 줄 예산 준수 (이중 언어 산출물은 2.5배 허용). |

LLM-judge 단계는 Claude에게 다음을 채점하게 한다:
- 입력 정보 커버리지 (1-5)
- 구체성 vs 기업 화법 (1-5)
- agent 하드 룰 준수 (1-5)

## 새 spec 추가

1. `src/artifact-spec.ts`의 `SPECS`에 항목 추가.
2. `examples/<spec-id>.good.md`에 통과 예시.
3. (선택) `examples/<spec-id>.bad.md`로 한 검사를 의도적 위반 + 해당 테스트.
4. `npm test` 재실행.
