# Productization Proposal — Cross-Border Instant Card (CBIC-1)

- **Owner**: Product — Park Soo-jin
- **Status**: in-review
- **Generated**: 2026-05-07
- **Linked issue**: BANK-1842
- **Linked artifacts**: sales-requirements.md, software-prd.md (draft), design-brief.md (draft)
- **Anchor customer**: ACME Trade

## Problem

Corporate travel cards in market do not settle FX at point of sale. Spread + fee
burden is opaque, averaging 2.8% in the corporate segment. Treasury teams
cannot enforce per-trip caps in real time.

## Proposed product

CBIC — Cross-Border Instant Card. A corporate card product that settles FX
live at swipe using our internal FX engine, exposes a treasury console for
per-employee caps and SAP exports, and targets all-in cost under **0.5%**
(spread 0.3% + fee 0.2%).

## Differentiation

| Competitor | All-in cost | Real-time FX | Treasury console |
|---|---|---|---|
| Bank A Travel Pro | 2.6% | No | Limited |
| Fintech B Card | 1.4% | Partial | Yes |
| **CBIC (proposed)** | **0.5%** | **Yes** | **Yes** |

## Pricing model

- Issuance: free above 50 cards.
- Monthly per-card fee: 8,000 KRW.
- FX revenue: 0.3% spread.

## Risks and asks

- **Engineering**: confirm FX engine carries corporate volume (3.5x retail peak).
- **Legal**: validate corporate FX licensing for v1.1 (EUR/GBP).
- **Design**: define treasury console IA — separate workstream.

## Decision sought

Approve scope as a Tier-1 initiative for Q3 2026.
