# Ontology — Design agency / project shop

A tuned ontology for an agency where the design *is* the deliverable. The
default ontology assumes the artifact stream produces software; here it
produces creative work for clients.

## Decision states

Five states, but two get renamed for the agency context.

| State | Definition (changed wording in italic) |
|---|---|
| `draft` | Internal team is composing. |
| `client-review` | *Renamed from `in-review`.* Sent to the client; awaiting client feedback. |
| `internal-review` | New. Used between `draft` and `client-review` for partner / creative-director sign-off. |
| `revisions-requested` | *Renamed from `changes-requested`* to match agency vocabulary. |
| `signed-off` | *Renamed from `approved`.* Client signed off. |

## Artifact types

Replace the software-flavored catalog with agency artifacts.

| Artifact | Replaces / new |
|---|---|
| `creative-brief` | Replaces `productization-proposal`. Captures audience, brand, scope, deadline. |
| `concept-deck` | Replaces `software-prd` and `design-brief`. The actual creative output (presented to the client). |
| `client-feedback-log` | New. Captures structured client comments per concept-deck round. |
| `sign-off-form` | New. The signed approval that closes a concept-deck. |

## Roles

| Role | Authority |
|---|---|
| `creative-director` | Owns `concept-deck`. Approves internal-review. |
| `account` | Owns client communication. Drafts `creative-brief` and `client-feedback-log`. |
| `producer` | Owns timeline, budget, deliverable scope. Reviews every brief. |
| `client` | Final approver. Signs `sign-off-form`. |
| `executive-partner` | Reviews briefs over a stated budget threshold. |

## Hard rules added

- A `concept-deck` cannot enter `client-review` without a passed
  `internal-review`.
- `client-feedback-log` is the *only* place client revisions live — agents
  must not synthesize them into the concept-deck without a re-issued deck.
- Every `signed-off` artifact links a `sign-off-form` with the client's
  signature/initials and the date.

## Agents and templates to adjust

- New agents: `creative-director-agent.md` (drafts concept-deck), `account-agent.md`
  (drafts brief and feedback log). The default `engineering-agent.md` is not used.
- New templates: `templates/creative-brief.md`, `templates/concept-deck.md`,
  `templates/client-feedback-log.md`, `templates/sign-off-form.md`.

---

## 한국어

# 온톨로지 — 디자인 에이전시 / 프로젝트 샵

디자인 *자체가* 산출물인 에이전시를 위한 튜닝 온톨로지. 기본 온톨로지는 산출물
스트림이 소프트웨어를 만든다고 가정하지만, 여기서는 클라이언트를 위한 크리에이티브
작업을 만든다.

## 의사결정 상태

5개. 에이전시 맥락에 맞게 둘은 이름 변경.

| 상태 | 정의 (변경된 문구는 이탤릭) |
|---|---|
| `draft` | 내부 팀 작성 중. |
| `client-review` | *`in-review`에서 이름 변경.* 클라이언트로 전달; 클라이언트 피드백 대기. |
| `internal-review` | 신규. 파트너/크리에이티브 디렉터 사인오프를 위해 `draft`와 `client-review` 사이에. |
| `revisions-requested` | *`changes-requested`에서 이름 변경* — 에이전시 용어 일치. |
| `signed-off` | *`approved`에서 이름 변경.* 클라이언트 사인오프 완료. |

## 산출물 종류

소프트웨어 색이 짙은 카탈로그를 에이전시 산출물로 교체.

| 산출물 | 교체 / 신규 |
|---|---|
| `creative-brief` | `productization-proposal` 교체. 사용자, 브랜드, 범위, 마감 캡처. |
| `concept-deck` | `software-prd`와 `design-brief`를 교체. 실제 크리에이티브 산출물(클라이언트 제시). |
| `client-feedback-log` | 신규. 각 concept-deck 라운드에 대한 클라이언트 코멘트 구조화 캡처. |
| `sign-off-form` | 신규. concept-deck를 닫는 서명된 승인. |

## 역할

| 역할 | 권한 |
|---|---|
| `creative-director` | `concept-deck` 오너. 내부 리뷰 승인. |
| `account` | 클라이언트 커뮤니케이션 오너. `creative-brief`와 `client-feedback-log` 작성. |
| `producer` | 일정, 예산, 산출물 범위 오너. 모든 brief 리뷰. |
| `client` | 최종 승인자. `sign-off-form` 서명. |
| `executive-partner` | 명시된 예산 임계 이상의 brief 리뷰. |

## 추가되는 하드 룰

- `concept-deck`는 `internal-review` 통과 없이 `client-review`로 진입 불가.
- `client-feedback-log`가 클라이언트 수정사항이 머무는 *유일한* 장소 — agent는
  새 deck 재발행 없이 concept-deck로 합성하지 말 것.
- 모든 `signed-off` 산출물은 클라이언트 서명/이니셜과 날짜가 있는
  `sign-off-form`을 연결한다.

## 조정해야 할 agent와 템플릿

- 신규 agent: `creative-director-agent.md` (concept-deck 작성),
  `account-agent.md` (brief과 feedback log 작성). 기본 `engineering-agent.md`는
  사용되지 않는다.
- 신규 템플릿: `templates/creative-brief.md`, `templates/concept-deck.md`,
  `templates/client-feedback-log.md`, `templates/sign-off-form.md`.
