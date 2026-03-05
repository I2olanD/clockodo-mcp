---
title: "Phase 3: Clock Tools"
status: completed
version: "1.0"
phase: 3
---

# Phase 3: Clock Tools

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/MCP Tool Definitions]` — Tool schemas for start_clock, stop_clock, get_running_entry
- `[ref: SDD/Primary Flow: Start Stopwatch]` — Full runtime sequence
- `[ref: SDD/Error Handling]` — Error type mapping table
- `[ref: PRD/Feature 4-6]` — Start, stop, get running entry acceptance criteria
- `[ref: PRD/Detailed Feature Specifications/Start Stopwatch]` — Business rules and edge cases

**Key Decisions**:
- Clock operations are never cached (always hit the API)
- All errors return `isError: true` with human-readable messages

**Dependencies**:
- Phase 1 complete (API client)
- Phase 2 not strictly required, but tools should be developed in order

---

## Tasks

Delivers the three clock tools that are the core value of the server.

- [ ] **T3.1 get_running_entry tool** `[activity: backend-api]`

  1. Prime: Read SDD tool definition for `get_running_entry` `[ref: SDD/MCP Tool Definitions/get_running_entry]`
  2. Test: Returns current entry details when clock is running `[ref: PRD/AC-6.1]`; returns null/indication when no clock running `[ref: PRD/AC-6.2]`
  3. Implement: Create `src/tools/get-running-entry.ts`. Register tool with no required params. Handler calls `client.getRunningEntry()`, formats result as JSON text content.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Running entry returned with full details `[ref: PRD/AC-6.1]`; no-entry case handled cleanly `[ref: PRD/AC-6.2]`

- [ ] **T3.2 start_clock tool** `[activity: backend-api]`

  1. Prime: Read SDD tool definition, business rules, and edge cases `[ref: SDD/MCP Tool Definitions/start_clock]` `[ref: PRD/Detailed Feature Specifications/Start Stopwatch]`
  2. Test: Creates entry with valid `customers_id` + `services_id` `[ref: PRD/AC-4.1]`; links to project when `projects_id` provided `[ref: PRD/AC-4.2]`; stores description when `text` provided `[ref: PRD/AC-4.3]`; returns error when clock already running (409) `[ref: PRD/AC-4.4]`; returns error on invalid IDs `[ref: PRD/AC-4.5]`; validates `text` max length (1000 chars)
  3. Implement: Create `src/tools/start-clock.ts`. Register tool with Zod schema: `customers_id` (required int), `services_id` (required int), `projects_id` (optional int), `text` (optional string max 1000). Handler calls `client.startClock(params)`. Handle 409 specifically with "clock already running" message.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Entry created with correct fields `[ref: PRD/AC-4.1-4.3]`; 409 handled `[ref: PRD/AC-4.4]`; invalid IDs handled `[ref: PRD/AC-4.5]`

- [ ] **T3.3 stop_clock tool** `[activity: backend-api]`

  1. Prime: Read SDD tool definition `[ref: SDD/MCP Tool Definitions/stop_clock]`
  2. Test: Stops running entry and returns duration `[ref: PRD/AC-5.1]`; returns error when no clock running `[ref: PRD/AC-5.2]`; 404 for invalid entry_id
  3. Implement: Create `src/tools/stop-clock.ts`. Register tool with required `entry_id` integer param. Handler calls `client.stopClock(entryId)`. Return stopped entry with duration.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Entry stopped with duration `[ref: PRD/AC-5.1]`; no-clock error `[ref: PRD/AC-5.2]`

- [ ] **T3.4 Phase Validation** `[activity: validate]`

  - Run all Phase 3 tests. Verify all three clock tools register correctly with MCP server. Verify error handling matches SDD error table. Lint and typecheck pass.
