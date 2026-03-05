# Specification: 005-introduce-biome-js-for-linting-formatting

## Status

| Field | Value |
|-------|-------|
| **Created** | 2026-03-05 |
| **Current Phase** | Ready |
| **Last Updated** | 2026-03-05 |

## Documents

| Document | Status | Notes |
|----------|--------|-------|
| requirements.md | completed | Full replacement with Biome.js, includes import sorting |
| solution.md | completed | 3 ADRs confirmed: exact pin, minimal scripts, JSON support |
| plan/ | completed | 2 phases, 6 tasks |

**Status values**: `pending` | `in_progress` | `completed` | `skipped`

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-05 | Spec created | Introduce biome.js for linting / formatting |
| 2026-03-05 | Full ESLint replacement | ESLint is unconfigured; clean-slate Biome setup has zero migration cost |
| 2026-03-05 | Include import sorting | Biome's built-in import organizer replaces need for separate plugin |
| 2026-03-05 | PRD completed | Requirements defined with 6 features across MoSCoW categories |
| 2026-03-05 | ADR-1: Exact version pin | Biome recommends exact pinning; rule behavior can change between versions |
| 2026-03-05 | ADR-2: Minimal scripts | lint + lint:fix only; biome check covers all domains |
| 2026-03-05 | ADR-3: Include JSON | Low risk, high convenience for consistent formatting |
| 2026-03-05 | SDD completed | Technical design with 3 confirmed ADRs |
| 2026-03-05 | PLAN completed | 2 phases: setup + formatting/validation |
| 2026-03-05 | Spec finalized | Ready for implementation |

## Context

Replace existing ESLint-based linting/formatting setup with Biome.js for faster, unified linting and formatting.

---
*This file is managed by the specify-meta skill.*
