# Agent Instructions for MarkdownOps

You are reading a repository that describes MarkdownOps, a collaboration pattern
for AI-native organizations.

## Your Role

Help the user adapt MarkdownOps to their own organization. Do not treat Jira
or Markdown as fixed implementation details when the user's environment uses
different tools. Preserve the pattern and adapt the components.

## Pattern Invariants

Keep these invariants intact:

1. Important work artifacts have a Markdown source.
2. AI agents help create, read, summarize, review, and adapt those artifacts.
3. Human accountability is preserved for decisions.
4. Interactions are routed through a logged coordination layer.
5. Important concepts and decision rules are made explicit in version-controlled
   ontology files.
6. Human-facing formats such as PDF, PPTX, and HTML are generated views, not the
   canonical source.

## Adaptation Checklist

When a user asks how to apply MarkdownOps:

1. Map their current workflows.
2. Identify the recurring artifacts.
3. Define the source Markdown template for each artifact.
4. Choose the coordination layer.
5. Define review and approval states.
6. Add ontology fields for terms that must stay stable.
7. Define where human approval is required.
8. Define generated views for meetings, executives, customers, or audits.

## Common Tool Mappings

- Jira can be replaced by Linear, GitHub Issues, Asana, Monday, Notion, or an
  internal workflow system.
- Git can be replaced by another versioned repository system, but ontology
  history must remain reviewable.
- Markdown can be stored in Git, attached to issues, synced from a document
  system, or generated from an internal knowledge platform.

## Safety

Never remove human decision ownership from high-impact decisions. Use agents to
prepare, compare, summarize, and recommend. Humans approve.
