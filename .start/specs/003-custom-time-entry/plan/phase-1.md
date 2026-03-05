---
title: "Phase 1: Core Implementation"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Core Implementation

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Building Block View; MCP Tool Schema Change]`
- `[ref: SDD/Implementation Examples; Time Window Calculation Logic]`
- `[ref: SDD/Runtime View; Primary Flow]`

**Key Decisions**:
- ADR-1: Parameter named `start_time`, optional ISO 8601 with offset support
- ADR-2: UTC normalization via `new Date(input).toISOString().replace(/\.\d{3}Z$/, "Z")`
- ADR-3: Only `src/tools/add-entry.ts` modified

**Dependencies**:
- None (first phase)

---

## Tasks

Establishes the custom start time capability in the `add_entry` tool handler with full test coverage.

- [ ] **T1.1 Custom start_time handler logic** `[activity: backend-api]`

  1. Prime: Read `src/tools/add-entry.ts` and `src/tools/add-entry.test.ts`. Review SDD Implementation Examples for time calculation logic. `[ref: SDD/Implementation Examples; Time Window Calculation Logic]`
  2. Test: Custom start_time sets time_since and calculates time_until `[ref: PRD/Feature 1, AC1]`; timezone offset normalized to UTC `[ref: PRD/Feature 1, AC3]`; midnight crossover handled correctly `[ref: PRD/Feature 1, AC4]`; zero duration with custom start_time `[ref: PRD/Feature 1, AC5]`; existing behavior preserved when start_time omitted `[ref: PRD/Feature 2, AC1]`
  3. Implement: Modify `handleAddEntry` in `src/tools/add-entry.ts` — add `start_time?: string` to args type, add conditional branching: when `start_time` provided, `timeSince = new Date(start_time)` and `timeUntil = timeSince + duration`; when absent, keep existing `new Date()` logic. Apply millisecond stripping to both paths.
  4. Validate: All new and existing unit tests pass; `npm run lint` clean; `npm run typecheck` clean
  5. Success:
    - [ ] Custom start_time entry created at specified time `[ref: PRD/Feature 1, AC1]`
    - [ ] Timezone offsets normalized to UTC `[ref: PRD/Feature 1, AC3]`
    - [ ] Midnight crossover calculated correctly `[ref: PRD/Feature 1, AC4]`
    - [ ] Zero duration with start_time produces equal timestamps `[ref: PRD/Feature 1, AC5]`
    - [ ] Omitting start_time preserves existing behavior `[ref: PRD/Feature 2, AC1]`

- [ ] **T1.2 Zod schema update** `[activity: backend-api]`

  1. Prime: Read SDD MCP Tool Schema Change section. Review Zod `z.string().datetime({ offset: true })` behavior. `[ref: SDD/Building Block View; MCP Tool Schema Change]`
  2. Test: Invalid ISO strings rejected by schema; valid UTC and offset strings accepted `[ref: PRD/Feature 1, edge case: invalid ISO]`
  3. Implement: Add `start_time: z.string().datetime({ offset: true }).optional().describe(...)` to the Zod schema in `registerAddEntry`. Update the `args` type annotation in the handler closure. Update tool description to mention optional start_time.
  4. Validate: Zod validation rejects "tomorrow at 10am"; accepts "2026-03-06T10:00:00Z" and "2026-03-06T10:00:00+01:00"; `npm run typecheck` clean
  5. Success:
    - [ ] Schema accepts valid ISO 8601 datetime with and without offset `[ref: SDD/ADR-1]`
    - [ ] Schema rejects non-ISO strings at validation level `[ref: PRD/Feature 1, edge case]`
    - [ ] Tool description updated with start_time explanation `[ref: PRD/Feature 3, AC1]`

- [ ] **T1.3 Phase Validation** `[activity: validate]`

  - Run all Phase 1 tests. Verify against SDD patterns and PRD acceptance criteria. Lint and typecheck pass. All existing tests unchanged and green.
