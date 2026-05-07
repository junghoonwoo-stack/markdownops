# Templates

Markdown templates for the artifacts the [agents/](../agents/) produce.

These templates capture the canonical structure of each artifact type. They are
the contract between artifact authors and the rest of the workflow:

- Coordination layer connectors parse the metadata block to set status, owner,
  and links.
- Reviewer agents look for the same section names in the same order.
- Generated views (PDF, PPTX, dashboards) map sections to layout regions.

Use a template when:

- You are writing an artifact by hand.
- You are scaffolding a new project and want examples to share with the team.
- You are testing or evaluating an agent's output (compare the agent's output
  to the template's structure).

## Templates in this collection

| File | Produced by | Reviewed by |
|---|---|---|
| `sales-requirements.md` | sales-agent | product-agent |
| `productization-proposal.md` | product-agent | engineering-agent, design-agent, legal-reviewer |
| `software-prd.md` | engineering-agent | product-agent, design-agent |
| `design-brief.md` | design-agent | product-agent, engineering-agent |
| `decision-memo.md` | any decision-owner | any reviewer |
| `meeting-minutes.md` | any participant | any participant |

## Common header

Every artifact starts with the same metadata block. Coordination connectors
parse it; reviewer agents rely on it; generated views project it as a header
strip.

```
- **Owner**: <role> — <name>
- **Status**: draft | in-review | approved | changes-requested | blocked
- **Generated**: <YYYY-MM-DD>
- **Linked issue**: <id from coordination layer, or TBD>
- **Linked artifacts**: <comma-separated filenames, or "(none)">
```

The order of the keys is fixed. A connector should be able to parse this block
with a regex; do not rearrange it.

## Filling a template

Placeholders are written `<like-this>` (angle-bracketed, hyphenated).

1. Read the entire template before filling. Sections are ordered for a reason.
2. Replace every `<placeholder>`. If a placeholder does not apply, replace it
   with the literal text `(not applicable)` and keep the line — do not delete
   the line.
3. Keep section headings exactly as written. Reviewer agents and connectors
   match on the heading text.
4. Stay under the line budget noted at the top of the template.

## Adding a new template

1. Decide which agent produces it. If no agent does, you probably want a new
   agent in [agents/](../agents/) too.
2. Use the common header.
3. Use bilingual section headings if the artifact will commonly cross language
   boundaries; otherwise pick one language and stay consistent.
4. Add a row to the table above.
5. Add (or update) one example in `tests/fixtures/` — see Phase 1D.

---

## 한국어

# 템플릿

[agents/](../agents/)가 생성하는 산출물의 Markdown 템플릿.

각 산출물 종류의 표준 구조를 담는다. 작성자와 워크플로우 나머지 사이의 계약 역할:

- coordination 커넥터는 메타데이터 블록을 파싱해 상태·담당·연결을 설정.
- 리뷰어 agent는 동일한 섹션명을 동일한 순서로 찾는다.
- 생성된 뷰(PDF·PPTX·대시보드)는 섹션을 레이아웃 영역에 매핑.

템플릿을 쓰는 경우:

- 산출물을 직접 작성할 때.
- 새 프로젝트를 시작하며 팀에 예시를 공유할 때.
- agent 출력을 테스트·평가할 때 (agent 출력과 템플릿 구조 비교).

## 수록 템플릿

| 파일 | 작성 agent | 리뷰 agent |
|---|---|---|
| `sales-requirements.md` | sales-agent | product-agent |
| `productization-proposal.md` | product-agent | engineering-agent, design-agent, legal-reviewer |
| `software-prd.md` | engineering-agent | product-agent, design-agent |
| `design-brief.md` | design-agent | product-agent, engineering-agent |
| `decision-memo.md` | 결정 오너 누구든 | 리뷰어 누구든 |
| `meeting-minutes.md` | 참석자 누구든 | 참석자 누구든 |

## 공통 헤더

모든 산출물은 동일한 메타데이터 블록으로 시작한다. coordination 커넥터가 파싱하고
리뷰어 agent가 이에 의존하며, 생성된 뷰가 헤더 스트립으로 투영한다.

```
- **담당**: <역할> — <이름>
- **상태**: 작성중 | 리뷰중 | 승인 | 변경요청 | 보류
- **작성일**: <YYYY-MM-DD>
- **연결 이슈**: <coordination layer ID 또는 TBD>
- **연결 산출물**: <쉼표 구분 파일명, 또는 "(없음)">
```

키 순서는 고정. 커넥터가 정규식으로 파싱할 수 있어야 하므로 재배열 금지.

## 템플릿 채우기

플레이스홀더는 `<이렇게>` (꺽쇠·하이픈) 표기.

1. 채우기 전에 템플릿 전체를 읽는다. 섹션 순서에는 이유가 있다.
2. 모든 `<placeholder>`를 교체. 해당되지 않으면 `(해당 없음)`으로 교체하되 라인은
   유지 — 라인 삭제 금지.
3. 섹션 헤딩은 정확히 그대로 유지. 리뷰어 agent와 커넥터가 헤딩 텍스트로 매칭.
4. 템플릿 상단의 줄 예산 이내 유지.

## 새 템플릿 추가

1. 어떤 agent가 이를 생성하는지 결정. 없다면 [agents/](../agents/)에 새 agent도 필요할 가능성.
2. 공통 헤더 사용.
3. 산출물이 언어 경계를 자주 넘는다면 이중 언어 섹션 헤딩, 아니라면 한 언어 고수.
4. 위 표에 행 추가.
5. `tests/fixtures/`에 예시 추가/갱신 — Phase 1D 참고.
