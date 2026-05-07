# Decision states

The five states a MarkdownOps artifact moves through. Every coordination
connector represents these as `mdops:status:<state>` labels (or the closest
equivalent in its native model — see each connector's README).

## draft

The artifact's owner is still composing it. Not ready for review.

- **Owner**: the artifact's `Owner` (the role-prefixed person in the metadata block).
- **Transitions to**: `in-review` (when the owner asks for review).
- **Transitions from**: rare — usually only from `changes-requested` after a
  large rewrite that warrants pulling out of review.

## in-review

Reviewers and their agents are reading the artifact and posting structured
review blocks. The owner is responding to questions but not unilaterally
revising the artifact.

- **Owner**: still the artifact's `Owner`. Reviewers do not own the artifact.
- **Transitions to**: `approved`, `changes-requested`, or `blocked`.
- **Stop condition**: every required reviewer has posted a review. Required
  reviewers are listed in the artifact's `Linked` block.

## approved

A decision has been logged. Implementation can proceed.

- **Authority**: the role designated by the artifact (e.g. Product approves a
  productization proposal; Engineering approves a PRD).
- **Terminal**: yes, for this artifact. Downstream artifacts (PRD after the
  proposal, etc.) start in `draft`.
- **Reversibility**: only via a new artifact that supersedes this one — do not
  un-approve in place.

## changes-requested

At least one required reviewer asked for changes. The owner needs to revise.

- **Owner**: returns to the artifact's `Owner`.
- **Transitions to**: `in-review` once revisions are made.
- **Note**: the reviewers who requested changes are responsible for
  re-reviewing once the artifact returns to `in-review`.

## blocked

Cannot proceed without external action — a contract, an external dependency,
a regulatory filing, an executive decision.

- **Owner**: the artifact's `Owner` is responsible for surfacing the blocker;
  the role that owns the unblock is named in the review that flagged it.
- **Transitions to**: `in-review` once the external action lands.
- **Hard rule**: the comment that set this state must include a path to
  unblock — "blocked" is never a final answer.

## Visualizing the graph

```text
draft  ───────────►  in-review  ───►  approved
   ▲                     │                 (terminal — supersede only)
   │                     ├───►  changes-requested  ───►  in-review
   │                     └───►  blocked            ───►  in-review
   │
   └── (rare) heavy rewrite from changes-requested
```

---

## 한국어

# 의사결정 상태

MarkdownOps 산출물이 거치는 다섯 상태. 모든 협업 커넥터는 이 상태를
`mdops:status:<state>` 라벨(또는 해당 도구의 가장 가까운 표현 — 각 커넥터
README 참조)로 표현한다.

## draft (작성중)

산출물 오너가 아직 작성 중. 리뷰 받을 준비 안 됨.

- **오너**: 산출물의 `Owner` (메타데이터 블록의 역할 접두 인물).
- **전이**: → `in-review` (오너가 리뷰 요청 시).
- **역방향**: 드물다 — 보통 `changes-requested`에서 큰 재작업이 필요해 다시
  꺼낼 때만.

## in-review (리뷰중)

리뷰어와 그들의 agent가 산출물을 읽고 구조화된 리뷰 블록을 게시 중. 오너는
질문에 답하되 단독으로 산출물을 재작성하지 않는다.

- **오너**: 여전히 산출물의 `Owner`. 리뷰어는 산출물을 소유하지 않는다.
- **전이**: → `approved` / `changes-requested` / `blocked`.
- **정지 조건**: 모든 필수 리뷰어가 리뷰를 게시. 필수 리뷰어는 산출물의
  `Linked` 블록에 명시.

## approved (승인)

결정이 로그되었다. 실행 가능.

- **권한**: 산출물이 지정한 역할 (예: 상품화 발의서는 Product가, PRD는
  Engineering이 승인).
- **종착**: 이 산출물에 대해서는 그렇다. 하류 산출물(발의서 후의 PRD 등)은
  새로 `draft`에서 시작.
- **가역성**: 이를 대체하는 새 산출물을 통해서만 — in-place로 승인 취소 금지.

## changes-requested (변경 요청)

최소 한 명의 필수 리뷰어가 변경을 요청. 오너가 수정해야 한다.

- **오너**: 산출물의 `Owner`로 돌아간다.
- **전이**: 수정 후 → `in-review`.
- **노트**: 변경을 요청한 리뷰어가 재리뷰의 책임을 진다 — `in-review`로 돌아오면.

## blocked (보류)

외부 조치 없이는 진행 불가 — 계약, 외부 의존성, 규제 신고, 경영진 결정.

- **오너**: 산출물의 `Owner`가 블로커를 가시화할 책임. 풀 권한이 있는 역할은
  이를 표시한 리뷰에 명시.
- **전이**: 외부 조치가 완료되면 → `in-review`.
- **하드 룰**: 이 상태로 옮긴 코멘트는 풀기 위한 경로를 포함해야 한다 —
  "blocked"는 절대 최종 답이 아니다.

## 그래프

```text
draft  ───────────►  in-review  ───►  approved
   ▲                     │                 (종착 — 대체로만 변경)
   │                     ├───►  changes-requested  ───►  in-review
   │                     └───►  blocked            ───►  in-review
   │
   └── (드물게) changes-requested에서 큰 재작업
```
