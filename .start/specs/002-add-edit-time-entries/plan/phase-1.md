---
title: "Phase 1: Core Infrastructure"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Core Infrastructure

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Application Data Models]` — `CreateEntryParams`, `UpdateEntryParams`, `Entry` extension
- `[ref: SDD/Internal API Changes]` — `createEntry()` and `updateEntry()` client methods

**Key Decisions**:
- ADR-3: Extend `Entry` with `billable` field, add new param interfaces
- ADR-4: No caching for write operations

**Dependencies**:
- None — this is the first phase

---

## Tasks

Establishes the Clockodo API client extensions needed by the tool implementations in Phase 2.

- [ ] **T1.1 Entry Types Extension** `[activity: domain-modeling]` `[ref: SDD/Application Data Models]`

  1. Prime: Read `src/clockodo-client.ts` — understand existing `Entry`, `StartClockParams` interfaces
  2. Test: Type-level verification — `CreateEntryParams` requires `customers_id`, `services_id`, `billable`, `time_since`, `time_until`; `UpdateEntryParams` has all fields optional; `Entry` includes `billable: number`
  3. Implement: Add `billable` to `Entry` interface, add `CreateEntryParams` and `UpdateEntryParams` interfaces to `src/clockodo-client.ts`
  4. Validate: `pnpm run typecheck` passes; existing tests still pass
  5. Success: New interfaces exported and usable `[ref: SDD/Application Data Models]`

- [ ] **T1.2 ClockodoClient.createEntry method** `[activity: backend-api]` `[ref: SDD/Internal API Changes]`

  1. Prime: Read `startClock()` method in `src/clockodo-client.ts` for POST pattern; read `src/clockodo-client.test.ts` for test patterns
  2. Test: Sends POST to `/v2/entries` with JSON body; includes auth headers; returns `body.entry` as `Entry`; propagates `ClockodoApiError` on failure
  3. Implement: Add `createEntry(params: CreateEntryParams): Promise<Entry>` to `ClockodoClient`
  4. Validate: Unit tests pass; typecheck passes
  5. Success: `createEntry` sends correct HTTP request and parses response `[ref: PRD/Feature 1 AC]`

- [ ] **T1.3 ClockodoClient.updateEntry method** `[activity: backend-api]` `[ref: SDD/Internal API Changes]`

  1. Prime: Read `stopClock()` method for DELETE-by-ID pattern; adapt for PUT
  2. Test: Sends PUT to `/v2/entries/{id}` with JSON body; includes auth headers; returns `body.entry` as `Entry`; propagates `ClockodoApiError` on 404
  3. Implement: Add `updateEntry(entryId: number, params: UpdateEntryParams): Promise<Entry>` to `ClockodoClient`
  4. Validate: Unit tests pass; typecheck passes
  5. Success: `updateEntry` sends correct HTTP request and parses response `[ref: PRD/Feature 2 AC]`

- [ ] **T1.4 Phase Validation** `[activity: validate]`

  - Run all Phase 1 tests (`pnpm test`). Verify against SDD patterns. `pnpm run lint` and `pnpm run typecheck` pass. All existing tests still green.
