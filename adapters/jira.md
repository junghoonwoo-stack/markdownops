# Jira Adapter

Jira is a natural coordination layer for MarkdownOps because it already provides
issues, ownership, status, comments, history, permissions, and audit trails.

## Role of Jira

In MarkdownOps, Jira is not only a task tracker. It is the logged interaction
surface for:

- human-to-human review
- human-to-agent requests
- agent-to-human summaries
- agent-to-agent handoffs
- decision logging
- approval and escalation

## Recommended Jira Issue Shape

Each MarkdownOps issue should contain:

- title
- owner
- decision type
- current status
- linked Markdown artifact
- stakeholders
- review deadline
- approval requirement
- decision log
- generated views, if any

## Comment Pattern

Use structured comments so agents can parse them reliably.

```md
## Review

Reviewer: @name
Role: Product / Design / Engineering / Legal / Finance
Decision: approve | request-changes | block | escalate

### Summary

Short summary of the review.

### Concerns

- Concern 1
- Concern 2

### Required Changes

- Change 1
- Change 2
```

## Automation Hooks

Agents can watch for:

- Markdown artifact updated
- status changed
- reviewer assigned
- deadline approaching
- blocked decision
- ontology term missing
- conflicting comments

## Portability

The same adapter can be translated to Linear, GitHub Issues, Asana, or an
internal workflow tool if the target system supports comments, status,
ownership, and history.
