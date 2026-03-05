---
title: "Phase 1: Project Setup & Core Infrastructure"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Project Setup & Core Infrastructure

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Constraints; lines: 1-6]` — Language, transport, auth requirements
- `[ref: SDD/Project Commands]` — npm scripts and build config
- `[ref: SDD/Directory Map]` — Full project structure
- `[ref: SDD/Clockodo API Client Interface]` — Client types and methods
- `[ref: SDD/In-Memory TTL Cache example]` — Cache implementation pattern

**Key Decisions**:
- ADR-1: TypeScript + Node.js with `@modelcontextprotocol/sdk`
- ADR-2: Custom fetch wrapper (no clockodo npm package)
- ADR-3: In-memory TTL cache with 5-minute TTL

**Dependencies**:
- None — this is the first phase

---

## Tasks

Establishes the project skeleton, API client, and cache — the foundation all tools depend on.

- [ ] **T1.1 Project scaffold** `[activity: project-setup]`

  1. Prime: Read SDD Directory Map and Project Commands `[ref: SDD/Directory Map]` `[ref: SDD/Project Commands]`
  2. Test: `npm test` runs without errors; `npm run typecheck` passes; `npm run lint` passes
  3. Implement: Initialize `package.json` with dependencies (`@modelcontextprotocol/sdk`, `zod`), devDependencies (`typescript`, `vitest`, `eslint`, `@types/node`). Create `tsconfig.json`, `.eslintrc`, `vitest.config.ts`. Create `src/index.ts` stub. Create `.env.example` with `CLOCKODO_EMAIL` and `CLOCKODO_API_KEY`.
  4. Validate: All three commands pass on empty project
  5. Success: Project builds, tests run, linting passes

- [ ] **T1.2 TTL Cache** `[activity: domain-modeling]`

  1. Prime: Read SDD cache example and Cache component description `[ref: SDD/In-Memory TTL Cache example]`
  2. Test: `get()` returns undefined for missing keys; `get()` returns cached value within TTL; `get()` returns undefined after TTL expires; `set()` overwrites existing entries; `clear()` removes all entries
  3. Implement: Create `src/cache.ts` with `TtlCache` class (generic `get<T>`, `set`, `clear`)
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Cache stores and retrieves values; expired entries return undefined `[ref: SDD/ADR-3]`

- [ ] **T1.3 Clockodo API Client** `[activity: backend-api]`

  1. Prime: Read SDD client interface and integration points `[ref: SDD/Clockodo API Client Interface]` `[ref: SDD/Integration Points]`
  2. Test: Correct auth headers sent on every request; paginated responses are aggregated into single array; HTTP 401 throws authentication error; HTTP 429 throws rate limit error; HTTP 4xx/5xx throws descriptive error; network failure throws descriptive error
  3. Implement: Create `src/clockodo-client.ts` with `ClockodoClient` class. Constructor takes `email`, `apiKey`. Implements `fetchAllPages<T>()` for paginated list endpoints. Implements all 6 methods from SDD interface. Uses `TtlCache` for list methods.
  4. Validate: Unit tests pass with mocked fetch; lint clean; types check
  5. Success: Client sends correct headers `[ref: PRD/AC-1.3]`; handles pagination `[ref: PRD/AC-1.2]`; maps all error codes to descriptive messages `[ref: SDD/Error Handling]`

- [ ] **T1.4 Phase Validation** `[activity: validate]`

  - Run all Phase 1 tests. Verify against SDD patterns and PRD acceptance criteria. Lint and typecheck pass.
