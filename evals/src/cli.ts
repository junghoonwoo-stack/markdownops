#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SPECS } from "./artifact-spec.js";
import { runAllChecks, summarize } from "./checks.js";
import { judge } from "./judge.js";

interface Args {
  spec?: string;
  file?: string;
  judge: boolean;
  agentRole?: string;
  agentPromptPath?: string;
  inputPath?: string;
  list: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { judge: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--spec":
        args.spec = argv[++i];
        break;
      case "--file":
        args.file = argv[++i];
        break;
      case "--judge":
        args.judge = true;
        break;
      case "--agent-role":
        args.agentRole = argv[++i];
        break;
      case "--agent-prompt":
        args.agentPromptPath = argv[++i];
        break;
      case "--input":
        args.inputPath = argv[++i];
        break;
      case "--list":
        args.list = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
markdownops evals

Usage:
  npm run eval -- --spec <id> --file <path>           run deterministic checks
  npm run eval -- --spec <id> --file <path> --judge   also run LLM-judge
  npm run eval -- --list                              list available specs

Options:
  --spec <id>           artifact spec id (e.g. sales-requirements)
  --file <path>         path to the artifact output to evaluate
  --judge               additionally call Claude to score quality
                        (requires ANTHROPIC_API_KEY)
  --agent-role <text>   role label for the judge (default: derived from spec)
  --agent-prompt <path> path to the agent system prompt for the judge
  --input <path>        path to the input fed to the agent (for the judge)
  --list                print the registered specs
  -h, --help            show this message
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    console.log("Available specs:");
    for (const spec of Object.values(SPECS)) {
      console.log(`  - ${spec.id.padEnd(28)}  ${spec.description}`);
    }
    return;
  }

  if (!args.spec || !args.file) {
    printHelp();
    process.exit(1);
  }

  const filePath = resolve(args.file);
  const output = await readFile(filePath, "utf-8");
  const results = runAllChecks(args.spec, output);
  const sum = summarize(results);

  console.log(`\n=== ${args.spec}  (${args.file}) ===`);
  for (const r of results) {
    const badge = r.passed ? "PASS" : "FAIL";
    console.log(`  [${badge}] ${r.name}${r.details ? "  — " + r.details : ""}`);
  }
  console.log(`\nDeterministic: ${sum.passedCount}/${sum.total} passed`);

  if (args.judge) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("\n[judge] skipped — set ANTHROPIC_API_KEY to enable.");
    } else if (!args.agentPromptPath || !args.inputPath) {
      console.warn(
        "\n[judge] skipped — pass --agent-prompt and --input to score with the LLM judge."
      );
    } else {
      const agentPrompt = await readFile(resolve(args.agentPromptPath), "utf-8");
      const input = await readFile(resolve(args.inputPath), "utf-8");
      const score = await judge({
        apiKey,
        agentRole: args.agentRole ?? args.spec,
        agentPrompt,
        input,
        output,
      });
      console.log(
        `\nLLM-judge: coverage=${score.coverage}/5, specificity=${score.specificity}/5, hardRules=${score.hardRules}/5`
      );
      console.log(`  ${score.reasoning}`);
    }
  }

  if (!sum.passed) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(2);
});
