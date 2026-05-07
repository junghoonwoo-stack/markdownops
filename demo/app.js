// MarkdownOps demo — UI logic.
// State machine + render loop. Vanilla JS, no framework.

const STORAGE_KEY = "markdownops-demo-state";

const initialState = () => ({
  step: 0,
  lang: "en",
  mode: "recorded",
  apiKey: "",
  capturedNeed: null,
  artifacts: [],
  activeArtifactIdx: -1,
  log: [],
  decisions: { product: null, engineering: null, design: null, legal: null },
  reviewsRun: false,
  liveOverrides: {},
  paneTab: "rendered",
});

let state = loadState() || initialState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
function resetState() {
  if (!confirm("Reset the demo to step 1? This clears decisions and live drafts.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = initialState();
  render();
}

const t = (obj) => (obj && (obj[state.lang] ?? obj.en)) ?? "";
const fmtTime = (iso) => new Date(iso).toLocaleTimeString();

function logEvent(type, who, text) {
  state.log.push({ type, who, text, ts: new Date().toISOString() });
}

function addArtifact(name) {
  if (!state.artifacts.find((a) => a.name === name)) {
    state.artifacts.push({ name });
  }
  state.activeArtifactIdx = state.artifacts.findIndex((a) => a.name === name);
}

function getArtifactSource(name) {
  if (state.mode === "live" && state.liveOverrides[name]) {
    return state.liveOverrides[name];
  }
  const art = ARTIFACTS[name];
  if (!art) return "";
  return state.lang === "ko" ? art.ko : art.en;
}

// --- Live API call -----------------------------------------------------------

async function callClaude(systemPrompt, userMessage) {
  if (!state.apiKey) throw new Error("API key required for live mode");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": state.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function maybeLive(artifactName, agentKey, userInput) {
  if (state.mode !== "live") return false;
  const btn = document.querySelector("#step-action button.primary");
  if (btn) {
    btn.disabled = true;
    btn.textContent = state.lang === "ko" ? "생성 중…" : "Generating…";
  }
  try {
    const md = await callClaude(AGENT_PROMPTS[agentKey], userInput);
    state.liveOverrides[artifactName] = md;
    return true;
  } catch (e) {
    alert(`Live API error: ${e.message}\nFalling back to recorded content.`);
    return false;
  } finally {
    if (btn) btn.disabled = false;
  }
}

// --- Step actions ------------------------------------------------------------

async function actCapture() {
  const ta = document.getElementById("need-input");
  const text = ta ? ta.value.trim() : "";
  state.capturedNeed = text || t(SCENARIO.initialNeed);
  await maybeLive("sales-requirements.md", "sales", state.capturedNeed);
  addArtifact("sales-requirements.md");
  logEvent("artifact", "Sales Agent", "Produced sales-requirements.md");
  state.step = 1;
  saveState();
  render();
}

function actRoute() {
  logEvent("issue", "Coordination", "Issue BANK-1842 created · status: in-review");
  REVIEWERS.forEach((r) => {
    logEvent("notify", "Coordination", `Notified ${r.name} (${t(r.role)}) and their agent`);
  });
  state.step = 2;
  saveState();
  render();
}

async function actReviews() {
  state.reviewsRun = true;
  for (const r of REVIEWERS) {
    const rev = REVIEWS[r.id];
    const summary = state.lang === "ko" ? rev.ko.summary : rev.en.summary;
    logEvent(
      "review",
      `${r.name} · ${t(r.role)} Agent`,
      `${rev.decision} — ${summary}`
    );
  }
  state.step = 3;
  saveState();
  render();
}

function actDecide(reviewerId, decision) {
  state.decisions[reviewerId] = decision;
  const r = REVIEWERS.find((x) => x.id === reviewerId);
  logEvent("decision", `Human (${t(r.role)} owner)`, `${decision} for ${r.name}'s review`);
  saveState();
  render();
}

function allDecided() {
  return REVIEWERS.every((r) => state.decisions[r.id] != null);
}

async function actCascade() {
  for (const [name, key, prevName] of [
    ["productization-proposal.md", "product", "sales-requirements.md"],
    ["software-prd.md", "engineering", "productization-proposal.md"],
    ["design-brief.md", "design", "productization-proposal.md"],
  ]) {
    const prev = getArtifactSource(prevName);
    await maybeLive(name, key, prev);
    addArtifact(name);
    const art = ARTIFACTS[name];
    logEvent("artifact", `${key} Agent`, `Produced ${name} (${t(art.label)})`);
  }
  state.step = 5;
  saveState();
  render();
}

// --- Step renderers ----------------------------------------------------------

function renderCapture() {
  const initial = state.capturedNeed || t(SCENARIO.initialNeed);
  return `
    <label class="block text-xs font-medium text-slate-500 mb-1">
      ${state.lang === "ko" ? "고객사 / 시나리오" : "Customer / scenario"}
    </label>
    <p class="text-sm mb-3">${esc(t(SCENARIO.customer))} — ${esc(t(SCENARIO.title))}</p>

    <label class="block text-xs font-medium text-slate-500 mb-1">
      ${state.lang === "ko" ? "영업 담당의 자유 입력" : "Sales rep's raw input"}
    </label>
    <textarea id="need-input" rows="9"
      class="w-full text-sm border rounded p-2 font-mono leading-snug">${esc(initial)}</textarea>

    <button class="primary mt-3 w-full px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
      onclick="actCapture()">
      ${state.lang === "ko" ? "Sales Agent 실행 → 영업요구조건서 생성" : "Run Sales Agent → produce sales-requirements.md"}
    </button>`;
}

function renderRoute() {
  return `
    <p class="text-sm text-slate-600 mb-3">
      ${state.lang === "ko"
        ? "협업 보드에 이슈를 만들고 4개 부서의 사람과 agent에게 알립니다."
        : "Create the coordination issue and notify four stakeholders and their agents."}
    </p>
    <ul class="text-sm space-y-1 mb-4">
      ${REVIEWERS.map(
        (r) => `<li class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
          <span class="font-medium">${esc(r.name)}</span>
          <span class="text-slate-500">· ${esc(t(r.role))}</span>
        </li>`
      ).join("")}
    </ul>
    <button class="primary w-full px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
      onclick="actRoute()">
      ${state.lang === "ko" ? "이슈 생성 + 알림 전송" : "Create issue + send notifications"}
    </button>`;
}

function renderReviews() {
  if (state.reviewsRun) {
    return `<p class="text-sm text-slate-600">
      ${state.lang === "ko" ? "리뷰가 협업 로그에 도착했습니다. 다음 단계로 이동하세요." : "Reviews have landed in the coordination log. Continue."}
    </p>`;
  }
  return `
    <p class="text-sm text-slate-600 mb-3">
      ${state.lang === "ko"
        ? "각 이해관계자의 agent가 동시에 산출물을 검토하고 구조화된 리뷰를 게시합니다."
        : "Each stakeholder's agent reads the artifact in parallel and posts a structured review."}
    </p>
    <ul class="text-sm space-y-1 mb-4">
      ${REVIEWERS.map(
        (r) => `<li>· <span class="font-medium">${esc(t(r.role))} Agent</span>
          (${state.lang === "ko" ? "보조: " : "for "}${esc(r.name)})</li>`
      ).join("")}
    </ul>
    <button class="primary w-full px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
      onclick="actReviews()">
      ${state.lang === "ko" ? "병렬 리뷰 실행" : "Run reviews in parallel"}
    </button>`;
}

function renderDecide() {
  const cards = REVIEWERS.map((r) => {
    const rev = REVIEWS[r.id];
    const block = state.lang === "ko" ? rev.ko : rev.en;
    const my = state.decisions[r.id];
    const pill = (label, value, color) => `
      <button onclick="actDecide('${r.id}','${value}')"
        class="px-2.5 py-1 rounded text-xs font-medium border ${
          my === value
            ? `bg-${color}-600 text-white border-${color}-600`
            : `text-${color}-700 border-${color}-300 hover:bg-${color}-50`
        }">${label}</button>`;
    return `
      <div class="border rounded p-3 bg-slate-50">
        <div class="flex items-baseline justify-between mb-1">
          <div class="text-sm">
            <span class="font-medium">${esc(r.name)}</span>
            <span class="text-slate-500"> · ${esc(t(r.role))}</span>
          </div>
          <span class="text-[10px] uppercase tracking-wide text-slate-400">${esc(rev.decision)}</span>
        </div>
        <p class="text-sm text-slate-700 mb-2">${esc(block.summary)}</p>
        ${block.concerns.length ? `<ul class="text-xs text-slate-600 list-disc pl-4 mb-2">
          ${block.concerns.map((c) => `<li>${esc(c)}</li>`).join("")}
        </ul>` : ""}
        <div class="flex gap-2 mt-2">
          ${pill(state.lang === "ko" ? "승인" : "Approve", "approve", "emerald")}
          ${pill(state.lang === "ko" ? "변경 요청" : "Request changes", "request-changes", "amber")}
          ${pill(state.lang === "ko" ? "보류" : "Block", "block", "rose")}
        </div>
      </div>`;
  }).join("");

  return `
    <p class="text-sm text-slate-600 mb-3">
      ${state.lang === "ko"
        ? "사람이 결정합니다. 각 리뷰에 대해 승인 / 변경 요청 / 보류를 선택하세요."
        : "Humans decide. For each review, click approve, request-changes, or block."}
    </p>
    <div class="space-y-3">${cards}</div>`;
}

function renderCascade() {
  const arts = [
    ["productization-proposal.md", "product"],
    ["software-prd.md", "engineering"],
    ["design-brief.md", "design"],
  ];
  return `
    <p class="text-sm text-slate-600 mb-3">
      ${state.lang === "ko"
        ? "승인된 영업요구조건서를 source로 하류 agent들이 병렬로 산출물을 만듭니다."
        : "Using the approved sales-requirements as source, downstream agents draft in parallel."}
    </p>
    <ul class="text-sm space-y-1 mb-4">
      ${arts
        .map(([name, agent]) => {
          const ready = state.artifacts.find((a) => a.name === name);
          return `<li>
            ${ready ? "✅" : "○"} <span class="font-medium">${esc(name)}</span>
            <span class="text-slate-500"> ← ${esc(agent)} agent</span>
          </li>`;
        })
        .join("")}
    </ul>
    <button class="primary w-full px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
      onclick="actCascade()">
      ${state.lang === "ko" ? "하류 산출물 생성" : "Generate downstream artifacts"}
    </button>`;
}

function renderRecap() {
  const counts = {
    artifacts: state.artifacts.length,
    reviews: REVIEWERS.length,
    decisions: Object.values(state.decisions).filter(Boolean).length,
    log: state.log.length,
  };
  const stat = (n, l) =>
    `<div class="bg-slate-50 rounded p-3">
       <div class="text-2xl font-semibold">${n}</div>
       <div class="text-xs text-slate-500 uppercase tracking-wide">${l}</div>
     </div>`;
  return `
    <div class="grid grid-cols-2 gap-3 mb-4">
      ${stat(counts.artifacts, state.lang === "ko" ? "Markdown 산출물" : "Markdown artifacts")}
      ${stat(counts.reviews, state.lang === "ko" ? "agent 리뷰" : "agent reviews")}
      ${stat(counts.decisions, state.lang === "ko" ? "사람 결정" : "human decisions")}
      ${stat(counts.log, state.lang === "ko" ? "협업 이벤트" : "coordination events")}
    </div>
    <p class="text-sm text-slate-600 mb-3">
      ${state.lang === "ko"
        ? "Markdown이 source of truth. 협업 레이어가 흐름을 기록. 사람이 결정. PDF / PPTX / 대시보드는 필요할 때 이 source에서 생성."
        : "Markdown is source of truth. Coordination layer logs the flow. Humans decide. PDF / PPTX / dashboards are generated from these sources on demand."}
    </p>
    <button class="w-full px-4 py-2 rounded border text-sm font-medium hover:bg-slate-50"
      onclick="resetState()">
      ${state.lang === "ko" ? "다시 시작" : "Restart demo"}
    </button>`;
}

const STEP_RENDERERS = [
  renderCapture, renderRoute, renderReviews, renderDecide, renderCascade, renderRecap,
];

// --- Main render -------------------------------------------------------------

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function renderStepper() {
  const el = document.getElementById("stepper");
  el.innerHTML = STEPS.map((s, i) => {
    const active = i === state.step;
    const done = i < state.step;
    return `
      <button onclick="goToStep(${i})"
        class="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition
          ${active ? "bg-slate-900 text-white" :
            done ? "text-slate-700 hover:bg-slate-100" :
            "text-slate-400"}">
        <span class="inline-block w-4 h-4 rounded-full text-[10px] leading-4 text-center
          ${active ? "bg-white text-slate-900" :
            done ? "bg-emerald-500 text-white" :
            "bg-slate-200"}">${done ? "✓" : i + 1}</span>
        ${esc(t(s.title).replace(/^\d+\.\s*/, ""))}
      </button>
      ${i < STEPS.length - 1 ? '<span class="text-slate-300">›</span>' : ""}`;
  }).join("");
}

function goToStep(i) {
  if (i > state.step) return; // prevent jumping ahead
  state.step = i;
  saveState();
  render();
}

function renderHeader() {
  document.getElementById("lang-toggle").textContent =
    state.lang === "en" ? "EN / 한" : "한 / EN";
  document.getElementById("mode-toggle").textContent =
    state.mode === "recorded" ? "Mode: Recorded" : "Mode: Live API";
  document.getElementById("mode-toggle").classList.toggle("bg-amber-50", state.mode === "live");
  document.getElementById("mode-toggle").classList.toggle("border-amber-300", state.mode === "live");
}

function renderActionPanel() {
  const s = STEPS[state.step];
  document.getElementById("step-title").textContent = t(s.title);
  document.getElementById("step-desc").textContent = t(s.desc);
  document.getElementById("step-action").innerHTML = STEP_RENDERERS[state.step]();

  // Prev button
  const prev = document.getElementById("prev-btn");
  prev.disabled = state.step === 0;
  prev.classList.toggle("opacity-30", state.step === 0);
  prev.textContent = state.lang === "ko" ? "← 뒤로" : "← Back";

  // Next button — only meaningful for steps that don't have a primary button
  const next = document.getElementById("next-btn");
  next.classList.add("hidden");
  if (state.step === 3 && allDecided()) {
    next.classList.remove("hidden");
    next.textContent = state.lang === "ko" ? "다음 →" : "Next →";
    next.onclick = () => { state.step = 4; saveState(); render(); };
  }
  if (state.step === 5) {
    // recap — no next
  }
}

function renderArtifactPanel() {
  const sw = document.getElementById("artifact-switcher");
  if (state.artifacts.length === 0) {
    sw.innerHTML = `<span class="text-xs text-slate-400">${
      state.lang === "ko" ? "산출물 없음 — Step 1을 실행하세요" : "No artifacts yet — run Step 1"
    }</span>`;
    document.getElementById("rendered-pane").innerHTML = "";
    document.getElementById("source-pane").textContent = "";
    return;
  }
  sw.innerHTML = state.artifacts
    .map((a, i) => {
      const art = ARTIFACTS[a.name];
      const label = art ? t(art.label) : a.name;
      const active = i === state.activeArtifactIdx;
      return `<button onclick="selectArtifact(${i})"
        class="px-2 py-1 rounded text-xs ${
          active ? "bg-slate-900 text-white" : "border hover:bg-slate-50"
        }" title="${esc(a.name)}">${esc(label)}</button>`;
    })
    .join("");

  const current = state.artifacts[state.activeArtifactIdx];
  if (!current) return;
  const md = getArtifactSource(current.name);
  document.getElementById("artifact-name").textContent = current.name;
  if (state.paneTab === "rendered") {
    document.getElementById("rendered-pane").innerHTML = marked.parse(md);
    document.getElementById("rendered-pane").classList.remove("hidden");
    document.getElementById("source-pane").classList.add("hidden");
  } else {
    document.getElementById("source-pane").textContent = md;
    document.getElementById("source-pane").classList.remove("hidden");
    document.getElementById("rendered-pane").classList.add("hidden");
  }
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("font-semibold", b.dataset.tab === state.paneTab);
    b.classList.toggle("text-slate-500", b.dataset.tab !== state.paneTab);
  });
}

function selectArtifact(i) { state.activeArtifactIdx = i; saveState(); render(); }

function renderLog() {
  const ul = document.getElementById("log");
  if (state.log.length === 0) {
    ul.innerHTML = `<li class="px-4 py-3 text-xs text-slate-400">${
      state.lang === "ko" ? "아직 이벤트 없음" : "No events yet"
    }</li>`;
    return;
  }
  ul.innerHTML = state.log
    .map((e) => {
      const color = {
        artifact: "emerald", issue: "indigo", notify: "slate",
        review: "amber", decision: "violet",
      }[e.type] || "slate";
      return `
        <li class="px-4 py-2 flex items-baseline gap-3">
          <span class="text-[10px] uppercase tracking-wide text-${color}-600 font-semibold w-20 shrink-0">${esc(e.type)}</span>
          <span class="text-xs text-slate-500 w-16 shrink-0">${fmtTime(e.ts)}</span>
          <span class="text-sm flex-1">
            <span class="font-medium">${esc(e.who)}</span>
            <span class="text-slate-600"> — ${esc(e.text)}</span>
          </span>
        </li>`;
    })
    .join("");
}

function render() {
  renderStepper();
  renderHeader();
  renderActionPanel();
  renderArtifactPanel();
  renderLog();
  saveState();
}

// --- Wiring ------------------------------------------------------------------

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lang-toggle").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ko" : "en";
    saveState();
    render();
  });
  document.getElementById("mode-toggle").addEventListener("click", () => {
    if (state.mode === "recorded") {
      const k = prompt(
        "Paste your Anthropic API key to enable live mode. Stored in memory only — wiped on refresh.\n\n" +
        "Anthropic API key를 입력하면 실 호출 모드로 전환됩니다. 메모리에만 저장 — 새로고침 시 지워집니다."
      );
      if (k && k.trim()) {
        state.apiKey = k.trim();
        state.mode = "live";
      }
    } else {
      state.mode = "recorded";
      state.apiKey = "";
      state.liveOverrides = {};
    }
    saveState();
    render();
  });
  document.getElementById("reset-btn").addEventListener("click", resetState);
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.paneTab = b.dataset.tab;
      saveState();
      render();
    });
  });
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (state.step > 0) {
      state.step--;
      saveState();
      render();
    }
  });
  // marked: GFM tables
  marked.setOptions({ gfm: true, breaks: false });
  render();
});
