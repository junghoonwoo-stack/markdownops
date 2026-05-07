# Design Brief — CBIC Treasury Console + Card UX

- **Owner**: Design — Lee Hae-rin
- **Status**: draft
- **Generated**: 2026-05-07
- **Linked issue**: BANK-1842
- **Linked artifacts**: productization-proposal.md, software-prd.md

## Audience

- **Primary**: corporate treasury operators (1–4 per account).
- **Secondary**: traveling employees using the CBIC card and mobile statement.
- **Tertiary**: ACME's expense reviewer (occasional, monthly).

## Design principles

1. **Treasury operators value control without latency.** Default to inline
   edits; avoid modal-confirmation pyramids.
2. **Travelers value clarity at the moment of swipe.** A push notification
   must show: USD amount, KRW amount, FX rate used, remaining daily cap.
3. **Reviewers value reconciliation.** Statement views must align 1:1 with
   SAP export columns.

## Surfaces

| Surface | Audience | v1 status |
|---|---|---|
| Treasury web console | Operators | required |
| iOS / Android push & in-app statement | Travelers | required |
| SAP CSV export | Reviewers | data-only |
| Public marketing page | Sales motion | required |

## Open design questions

- Cap-edit affordance: inline vs side-panel.
- Geo rule UX: per-country switches vs region templates.
- Dispute initiation: where it lives without colliding with CS.

## Next

Two-week design sprint kicking off 2026-05-12.
Deliverables: treasury console IA, mobile push spec, statement v1, dispute flow.
