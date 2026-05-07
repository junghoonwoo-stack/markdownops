# Runner — Raw API

Call Anthropic, OpenAI, or Google APIs directly with a MarkdownOps agent
loaded as the system prompt. No CLI runtime, no MCP. Useful when you need to
embed MarkdownOps inside a larger application.

## Quick start (Anthropic, Python)

```python
import anthropic

with open("agents/sales-agent.md") as f:
    system_prompt = f.read()

client = anthropic.Anthropic(api_key="...")

resp = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2000,
    system=system_prompt,
    messages=[{
        "role": "user",
        "content": "Draft a sales-requirements.md for a fictional customer doing X."
    }],
)
print(resp.content[0].text)
```

## Anthropic (TypeScript / Node)

```ts
import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";

const client = new Anthropic();
const system = await readFile("agents/sales-agent.md", "utf-8");

const resp = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 2000,
  system,
  messages: [{ role: "user", content: "Draft sales-requirements.md for ..." }],
});
console.log(resp.content[0].type === "text" ? resp.content[0].text : "");
```

## OpenAI (Python)

```python
from openai import OpenAI

client = OpenAI()
with open("agents/sales-agent.md") as f:
    system_prompt = f.read()

resp = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Draft a sales-requirements.md for ..."},
    ],
)
print(resp.choices[0].message.content)
```

## Google Gemini (Python)

```python
from google import genai

client = genai.Client(api_key="...")
with open("agents/sales-agent.md") as f:
    system_instruction = f.read()

resp = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Draft a sales-requirements.md for ...",
    config={"system_instruction": system_instruction},
)
print(resp.text)
```

## Working without MCP

Calling an API directly skips the MCP layer. The model returns Markdown text;
your application is responsible for:

1. **Persisting the artifact** — write the model's output to a file in your
   project directory.
2. **Routing it to a coordination layer** — call your tool's REST API (GitHub
   Issues, Jira, GitLab, etc.) from your application code.
3. **Posting reviewer comments** — for each reviewer agent, run the same loop
   with that agent's prompt and the artifact, then post the structured review
   block as a comment on the coordination unit.

This is what an MCP server does for you. If you find yourself rebuilding it,
consider running an MCP server (see [mcp.md](mcp.md)).

## Multi-agent orchestration in code

A typical MarkdownOps cycle in raw-API style:

```python
from pathlib import Path

def run_agent(agent_path: str, user_message: str) -> str:
    system = Path(agent_path).read_text()
    return call_llm(system=system, user=user_message)

# 1. Sales drafts
sales_req = run_agent("agents/sales-agent.md", customer_need_text)
Path("artifacts/sales-requirements.md").write_text(sales_req)

# 2. Each stakeholder agent reviews
reviews = {}
for role, path in [
    ("product", "agents/product-agent.md"),
    ("engineering", "agents/engineering-agent.md"),
    ("design", "agents/design-agent.md"),
    ("legal", "agents/legal-reviewer.md"),
]:
    reviews[role] = run_agent(path, f"Review this artifact:\n\n{sales_req}")

# 3. Persist and route (your code)
create_issue_with_reviews(sales_req, reviews)
```

The same orchestration is what an MCP-aware runtime does for you implicitly
when the agent calls `mdops_*` tools.

---

## 한국어

# 러너 — Raw API

Anthropic, OpenAI, Google API를 MarkdownOps agent를 system prompt로 직접 호출.
CLI runtime 없이, MCP 없이. MarkdownOps를 큰 애플리케이션 안에 임베드해야 할 때 유용.

## 퀵스타트 (Anthropic, Python)

```python
import anthropic

with open("agents/sales-agent.md") as f:
    system_prompt = f.read()

client = anthropic.Anthropic(api_key="...")

resp = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2000,
    system=system_prompt,
    messages=[{
        "role": "user",
        "content": "X를 하는 가상 고객의 sales-requirements.md 초안을 작성해줘."
    }],
)
print(resp.content[0].text)
```

## Anthropic (TypeScript / Node)

```ts
import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";

const client = new Anthropic();
const system = await readFile("agents/sales-agent.md", "utf-8");

const resp = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 2000,
  system,
  messages: [{ role: "user", content: "...의 sales-requirements.md 초안" }],
});
console.log(resp.content[0].type === "text" ? resp.content[0].text : "");
```

## OpenAI (Python)

```python
from openai import OpenAI

client = OpenAI()
with open("agents/sales-agent.md") as f:
    system_prompt = f.read()

resp = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "...의 sales-requirements.md 초안"},
    ],
)
print(resp.choices[0].message.content)
```

## Google Gemini (Python)

```python
from google import genai

client = genai.Client(api_key="...")
with open("agents/sales-agent.md") as f:
    system_instruction = f.read()

resp = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="...의 sales-requirements.md 초안",
    config={"system_instruction": system_instruction},
)
print(resp.text)
```

## MCP 없이 동작

API 직접 호출은 MCP 레이어를 건너뛴다. 모델은 Markdown 텍스트를 반환하고,
당신의 애플리케이션이 다음을 책임진다:

1. **산출물 영속화** — 모델 출력을 프로젝트 디렉터리의 파일로 작성.
2. **협업 레이어로 라우팅** — 사용 도구의 REST API(GitHub Issues, Jira, GitLab 등)를
   애플리케이션 코드에서 호출.
3. **리뷰어 코멘트 게시** — 각 리뷰어 agent에 대해 동일한 루프를 그 agent 프롬프트와
   산출물로 돌리고, 구조화된 리뷰 블록을 협업 단위의 코멘트로 게시.

이는 MCP 서버가 대신 해주는 일이다. 같은 일을 다시 만들고 있다면 MCP 서버 운영을
검토 ([mcp.md](mcp.md) 참조).

## 코드에서 다중 agent 오케스트레이션

raw-API 스타일의 전형적인 MarkdownOps 사이클:

```python
from pathlib import Path

def run_agent(agent_path: str, user_message: str) -> str:
    system = Path(agent_path).read_text()
    return call_llm(system=system, user=user_message)

# 1. 영업 작성
sales_req = run_agent("agents/sales-agent.md", customer_need_text)
Path("artifacts/sales-requirements.md").write_text(sales_req)

# 2. 각 이해관계자 agent 리뷰
reviews = {}
for role, path in [
    ("product", "agents/product-agent.md"),
    ("engineering", "agents/engineering-agent.md"),
    ("design", "agents/design-agent.md"),
    ("legal", "agents/legal-reviewer.md"),
]:
    reviews[role] = run_agent(path, f"이 산출물을 리뷰해:\n\n{sales_req}")

# 3. 영속화와 라우팅 (당신의 코드)
create_issue_with_reviews(sales_req, reviews)
```

agent가 `mdops_*` 도구를 호출할 때 MCP-인지 runtime이 대신 해주는 것과 동일한
오케스트레이션이다.
