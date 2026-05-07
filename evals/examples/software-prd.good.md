# PRD — CBIC Card Issuance and Real-time FX

- **Owner**: Engineering — Kim Min-ho
- **Status**: draft
- **Generated**: 2026-05-07
- **Linked issue**: BANK-1842
- **Linked artifacts**: productization-proposal.md (CBIC-1)

## Goal

Ship a card product with real-time FX settlement at POS, server-side per-card
caps, and treasury controls — by 2026-Q3.

## Non-goals

- Multi-currency beyond USD/KRW in v1 (deferred to v1.1).
- Personal accounts (corporate-only).

## Functional scope

1. Card issuance pipeline integrated with existing corporate KYC.
2. POS authorization flow with sub-200ms FX rate quote from internal FX engine.
3. Treasury console:
   - per-employee daily/monthly caps (server-side storage)
   - geo rules (allow/deny by country)
   - real-time transaction stream
   - scheduled SAP export (SFTP, CSV, daily 06:00 KST)
4. Settlement pipeline with daily reconciliation against FX engine and Visa/MC.

## SLOs

- **Authorization p95 latency**: 380ms (60-day rolling window).
- **Treasury console availability**: 99.9% (monthly).
- **SAP export job completion**: 06:30 KST (daily window 06:00–06:30).

## Open questions

- FX engine capacity at projected 3.5x retail peak — Platform team.
- Hold/release semantics for declined post-auth — Payments team.
- Disputes flow ownership — CS lead.

## Decision needed

Approve to enter design-and-build. Target sprint zero: 2026-05-19.
