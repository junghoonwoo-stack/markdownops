# MarkdownOps Demo

A browser-only, click-through demo of the MarkdownOps pattern. No build step.
Vanilla HTML + JS + CSS. Runs from any static file host.

## Run locally

```sh
# from repo root
python -m http.server 8080
# then open http://localhost:8080/demo/
```

Or any other static server. Opening `index.html` directly via `file://` also
works for the recorded path; live API mode requires `http://` or `https://`.

## What it shows

A six-step click-through of the MarkdownOps flow:

1. **Capture** — sales rep types a customer need; Sales Agent drafts `sales-requirements.md`.
2. **Route** — issue created on the coordination board; four stakeholders notified.
3. **Reviews** — each stakeholder's agent posts a structured review.
4. **Decide** — human approves / requests changes / blocks per review.
5. **Cascade** — productization proposal, software PRD, design brief drafted in parallel.
6. **Recap** — four Markdown artifacts, one logged thread, decisions in the audit trail.

## Modes

- **Recorded** (default): walks through pre-baked artifacts. Works without an API key.
- **Live**: click `Mode: Recorded` to switch. You will be prompted for an Anthropic
  API key (stored only in memory — wiped on refresh). Each agent step calls the API
  with the agent's prompt and the upstream artifact, producing fresh content.

## Files

- `index.html` — page shell
- `app.js` — state machine + rendering
- `data.js` — scenario, artifacts, reviews, agent prompts (edit to change the demo)
- `app.css` — light styling on top of Tailwind
- `.nojekyll` — disables Jekyll on GitHub Pages

## Deploy to GitHub Pages

1. Commit and push the `demo/` directory to `main`.
2. In the repo on GitHub: **Settings → Pages**.
3. **Source**: Deploy from a branch.
4. **Branch**: `main`, **Folder**: `/docs` is not used; pick `/ (root)` and Pages
   will serve everything. The demo URL will be:
   `https://<owner>.github.io/<repo>/demo/`

(Alternatively, move the demo's contents to `/docs/` if you want Pages to serve
just the demo.)

---

## 한국어

# MarkdownOps 데모

브라우저만으로 동작하는 MarkdownOps 패턴 클릭스루 데모. 빌드 단계 없음.
Vanilla HTML + JS + CSS. 어떤 정적 호스트에서도 동작.

## 로컬 실행

```sh
# 리포 루트에서
python -m http.server 8080
# 브라우저에서 http://localhost:8080/demo/ 열기
```

다른 정적 서버도 무방. `file://`로 `index.html`을 직접 열어도 녹화 경로는 동작.
라이브 API 모드는 `http://` 또는 `https://`이 필요.

## 무엇을 보여주는가

MarkdownOps 흐름의 6단계 클릭스루:

1. **Capture** — 영업이 고객 요구를 입력 → Sales Agent가 `sales-requirements.md` 작성.
2. **Route** — 협업 보드에 이슈 생성, 4개 이해관계자에게 알림.
3. **Reviews** — 각 agent가 구조화된 리뷰 게시.
4. **Decide** — 사람이 리뷰별로 승인 / 변경 요청 / 보류.
5. **Cascade** — 상품화 발의서, PRD, 디자인 발의서를 병렬로 작성.
6. **Recap** — 4개 Markdown 산출물, 하나의 로그 스레드, 감사 가능한 결정 이력.

## 모드

- **Recorded** (기본): 미리 작성된 산출물로 흐름을 보여줌. API key 불필요.
- **Live**: 상단 `Mode: Recorded` 클릭 → Anthropic API key 입력 (메모리에만 저장 —
  새로고침 시 지워짐). 각 agent 단계가 실제 API 호출로 새 내용 생성.

## 파일

- `index.html` — 페이지 셸
- `app.js` — 상태 머신 + 렌더링
- `data.js` — 시나리오, 산출물, 리뷰, agent 프롬프트 (이 파일을 고치면 데모가 바뀜)
- `app.css` — Tailwind 위에 얹은 가벼운 스타일
- `.nojekyll` — GitHub Pages의 Jekyll 처리 비활성화

## GitHub Pages 배포

1. `demo/` 디렉터리를 `main`에 commit & push.
2. GitHub 리포 → **Settings → Pages**.
3. **Source**: Deploy from a branch.
4. **Branch**: `main`, **Folder**: `/ (root)`. 데모 URL:
   `https://<owner>.github.io/<repo>/demo/`
