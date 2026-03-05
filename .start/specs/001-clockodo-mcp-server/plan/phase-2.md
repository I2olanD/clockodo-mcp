---
title: "Phase 2: List Tools"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: List Tools

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/MCP Tool Definitions]` — Tool input/output schemas for list tools
- `[ref: SDD/Tool Handler Pattern example]` — Consistent handler structure
- `[ref: PRD/Feature 1-3]` — List customers, projects, services acceptance criteria

**Key Decisions**:
- ADR-4: Tools only — each tool returns JSON text content
- List tools use cached API client methods

**Dependencies**:
- Phase 1 complete (T1.1 project scaffold, T1.2 cache, T1.3 API client)

---

## Tasks

Delivers the three list tools that enable the AI to present selection options to the user.

- [ ] **T2.1 list_customers tool** `[activity: backend-api]` `[parallel: true]`

  1. Prime: Read SDD tool definition for `list_customers` `[ref: SDD/MCP Tool Definitions/list_customers]`
  2. Test: Returns all active customers as JSON with id and name `[ref: PRD/AC-1.1]`; returns error on auth failure `[ref: PRD/AC-1.3]`
  3. Implement: Create `src/tools/list-customers.ts`. Register tool with MCP server using Zod schema (no required params). Handler calls `client.listCustomers()`, formats as JSON text content.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Tool returns active customers with id and name `[ref: PRD/AC-1.1]`; handles pagination transparently `[ref: PRD/AC-1.2]`

- [ ] **T2.2 list_projects tool** `[activity: backend-api]` `[parallel: true]`

  1. Prime: Read SDD tool definition for `list_projects` `[ref: SDD/MCP Tool Definitions/list_projects]`
  2. Test: Returns active projects filtered by `customers_id` when provided `[ref: PRD/AC-2.1]`; returns all active projects when no filter `[ref: PRD/AC-2.2]`; returns empty array for customer with no projects `[ref: PRD/AC-2.3]`; includes `customer_name` in response for disambiguation
  3. Implement: Create `src/tools/list-projects.ts`. Register tool with optional `customers_id` integer param. Handler calls `client.listProjects(customersId)`, formats as JSON text content.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Tool filters by customer `[ref: PRD/AC-2.1]`; returns all when unfiltered `[ref: PRD/AC-2.2]`; handles empty results `[ref: PRD/AC-2.3]`

- [ ] **T2.3 list_services tool** `[activity: backend-api]` `[parallel: true]`

  1. Prime: Read SDD tool definition for `list_services` `[ref: SDD/MCP Tool Definitions/list_services]`
  2. Test: Returns all active services with id and name `[ref: PRD/AC-3.1]`; returns empty array when no active services `[ref: PRD/AC-3.2]`
  3. Implement: Create `src/tools/list-services.ts`. Register tool with no required params. Handler calls `client.listServices()`, formats as JSON text content.
  4. Validate: Unit tests pass; lint clean; types check
  5. Success: Tool returns active services `[ref: PRD/AC-3.1]`; handles empty results `[ref: PRD/AC-3.2]`

- [ ] **T2.4 Phase Validation** `[activity: validate]`

  - Run all Phase 2 tests. Verify all three list tools register correctly with MCP server. Lint and typecheck pass.
