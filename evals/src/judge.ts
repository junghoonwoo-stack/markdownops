/**
 * Optional LLM-as-judge stage. Calls Anthropic's API to score an artifact along
 * three axes (1-5 each). Skipped automatically when ANTHROPIC_API_KEY is not set.
 *
 * The judge is intentionally separate from the deterministic checks so adopters
 * can run the full eval suite in CI without paying per-call costs or pinning a
 * model version.
 */

export interface JudgeScore {
  coverage: number; // 1-5
  specificity: number; // 1-5
  hardRules: number; // 1-5
  reasoning: string;
}

export interface JudgeOptions {
  apiKey: string;
  model?: string;
  agentRole: string; // e.g. "Sales Agent"
  agentPrompt: string;
  input: string; // what the agent was given
  output: string; // what the agent produced
}

const JUDGE_SYSTEM = `You are an evaluator for MarkdownOps agent outputs. You
will be given an agent's role description, the input it received, and the
artifact it produced. Score the artifact on three axes from 1 (worst) to 5
(best):

- coverage: did the output cover the meaningful information from the input?
- specificity: is it concrete and quantified where possible, or full of
  corporate hedging?
- hardRules: does it follow the role's explicit hard rules (Markdown only,
  language matching, line budget, structured review block when in review mode)?

Reply with a single JSON object: {"coverage": <1-5>, "specificity": <1-5>,
"hardRules": <1-5>, "reasoning": "<two sentences>"}. No markdown fences.`;

export async function judge(opts: JudgeOptions): Promise<JudgeScore> {
  const userMessage = [
    "## Agent role",
    opts.agentRole,
    "",
    "## Agent system prompt",
    opts.agentPrompt,
    "",
    "## Input given to the agent",
    opts.input,
    "",
    "## Output the agent produced",
    opts.output,
    "",
    "Score it.",
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? "claude-sonnet-4-5",
      max_tokens: 1024,
      system: JUDGE_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge API ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const text = data.content.find((c) => c.type === "text")?.text ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Judge did not return JSON: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(match[0]) as JudgeScore;
  return {
    coverage: Number(parsed.coverage),
    specificity: Number(parsed.specificity),
    hardRules: Number(parsed.hardRules),
    reasoning: String(parsed.reasoning ?? ""),
  };
}
