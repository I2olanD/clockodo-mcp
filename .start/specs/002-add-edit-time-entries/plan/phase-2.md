---
title: "Phase 2: Tool Implementations"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: Tool Implementations

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/MCP Tool Schemas]` — Zod input schemas for both tools
- `[ref: SDD/Runtime View/Primary Flow]` — add_entry sequence
- `[ref: SDD/Runtime View/Secondary Flow]` — edit_entry sequence
- `[ref: SDD/Implementation Examples]` — handler code examples

**Key Decisions**:
- ADR-1: Follow existing handler + register pattern
- ADR-2: Duration in minutes, convert to time window for add_entry; convert to seconds for edit_entry

**Dependencies**:
- Phase 1 must be complete (client methods available)

---

## Tasks

Implements the two MCP tools (`add_entry` and `edit_entry`) that use the client methods from Phase 1.

- [ ] **T2.1 add_entry Tool** `[activity: backend-api]` `[parallel: true]` `[ref: SDD/Runtime View/Primary Flow]`

  1. Prime: Read `src/tools/start-clock.ts` and `src/tools/start-clock.test.ts` for handler+register pattern and test patterns
  2. Test: Happy path creates entry with correct time window (time_until=now, time_since=now-duration); billable defaults to 1; billable=false maps to 0; optional projects_id and text forwarded; API errors return isError:true with message `[ref: PRD/Feature 1 AC]`
  3. Implement: Create `src/tools/add-entry.ts` with `handleAddEntry()` and `registerAddEntry()`; Zod schema per SDD; duration conversion logic
  4. Validate: Unit tests pass; typecheck passes; lint clean
  5. Success:
    - [ ] Entry created with correct duration conversion `[ref: PRD/Feature 1 AC-1]`
    - [ ] Project association works `[ref: PRD/Feature 1 AC-2]`
    - [ ] Billable defaults to 1 `[ref: PRD/Feature 1 AC-3]`
    - [ ] Billable=false maps to 0 `[ref: PRD/Feature 1 AC-4]`
    - [ ] Time window calculated correctly `[ref: PRD/Feature 1 AC-5]`
    - [ ] API errors handled `[ref: PRD/Feature 1 AC-6]`

- [ ] **T2.2 edit_entry Tool** `[activity: backend-api]` `[parallel: true]` `[ref: SDD/Runtime View/Secondary Flow]`

  1. Prime: Read `src/tools/stop-clock.ts` for single-entity-by-ID pattern
  2. Test: Updates duration (converts minutes to seconds); updates text; updates customer_id; updates project_id; updates billable; rejects when no fields provided; API errors (404, permission) return isError:true `[ref: PRD/Feature 2 AC]`
  3. Implement: Create `src/tools/edit-entry.ts` with `handleEditEntry()` and `registerEditEntry()`; Zod schema per SDD; validation that at least one field provided
  4. Validate: Unit tests pass; typecheck passes; lint clean
  5. Success:
    - [ ] Duration updated correctly `[ref: PRD/Feature 2 AC-1]`
    - [ ] Text updated `[ref: PRD/Feature 2 AC-2]`
    - [ ] Customer changed `[ref: PRD/Feature 2 AC-3]`
    - [ ] Project changed `[ref: PRD/Feature 2 AC-4]`
    - [ ] Invalid entry ID handled `[ref: PRD/Feature 2 AC-5]`
    - [ ] No-fields validation works `[ref: PRD/Feature 2 AC-6]`
    - [ ] Billable override works `[ref: PRD/Feature 3 AC]`

- [ ] **T2.3 Phase Validation** `[activity: validate]`

  - Run all Phase 2 tests (`pnpm test`). Verify both tools follow the same pattern as existing tools. `pnpm run lint` and `pnpm run typecheck` pass.
