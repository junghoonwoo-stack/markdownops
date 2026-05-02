# MarkdownOps Pattern

## Intent

Remove organizational bottlenecks caused by human-only documents and synchronous
explanation meetings.

## Context

Engineering teams accelerated because code was already structured, versioned,
reviewable, and AI-readable.

Non-engineering teams still coordinate through slides, meetings, and documents
that require human explanation. This creates translation loss between business,
product, design, and engineering.

## Pattern

Use Markdown as the shared representation for organizational artifacts.

Route Markdown artifacts through a logged coordination layer. Let AI agents read,
summarize, review, and adapt the artifacts for each participant. Keep humans in
the loop for decisions.

## Forces

- People do not want to learn a new document syntax.
- AI agents need structured, plain-text context.
- Companies need audit logs for decisions.
- Meetings are useful for judgment, but expensive for context transfer.
- Different departments use different tools and vocabularies.

## Solution

1. Generate major artifacts as Markdown through AI agents.
2. Attach or sync the Markdown to a Jira issue or equivalent coordination item.
3. Let each stakeholder's agent read the artifact and produce a local brief.
4. Capture questions, objections, approvals, and changes as logged comments.
5. Keep decision states and important terms in YAML ontology files.
6. Generate slides, PDFs, HTML pages, and dashboards from Markdown when needed.

## Resulting Context

The organization gains a shared source of truth that can be read by humans,
agents, and developers without translation loss.

Meetings shift from context transfer to judgment, negotiation, and escalation.
