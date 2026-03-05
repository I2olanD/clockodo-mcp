---
title: "Phase 4: Integration & Validation"
status: completed
version: "1.0"
phase: 4
---

# Phase 4: Integration & Validation

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/MCP Server component]` — Server entry point, tool registration, stdio transport
- `[ref: SDD/System Context Diagram]` — Full system architecture
- `[ref: SDD/Deployment View]` — MCP client configuration
- `[ref: SDD/Quality Requirements]` — Performance and reliability targets
- `[ref: PRD/Detailed Feature Specifications/Start Stopwatch]` — Full interactive flow

**Key Decisions**:
- ADR-1: TypeScript + stdio transport
- Server registers all 6 tools on startup

**Dependencies**:
- Phase 1, 2, 3 all complete

---

## Tasks

Wires all components into a working MCP server and validates the complete system.

- [ ] **T4.1 MCP Server entry point** `[activity: backend-api]`

  1. Prime: Read SDD server component and deployment view `[ref: SDD/MCP Server component]` `[ref: SDD/Deployment View]`
  2. Test: Server instantiates with valid env vars; server fails gracefully with missing env vars; all 6 tools are registered and discoverable; stdio transport connects successfully
  3. Implement: Complete `src/index.ts`. Read env vars (`CLOCKODO_EMAIL`, `CLOCKODO_API_KEY`). Validate required env vars are present. Instantiate `ClockodoClient`. Register all 6 tools from `tools/`. Create `StdioServerTransport` and connect. Handle startup errors.
  4. Validate: Server starts and responds to MCP tool list request; lint clean; types check
  5. Success: Server starts with valid config; fails clearly with missing config `[ref: SDD/Deployment View]`; all tools discoverable

- [ ] **T4.2 Integration tests** `[activity: testing]`

  1. Prime: Read PRD full flow specification and SDD sequence diagram `[ref: PRD/Detailed Feature Specifications/Start Stopwatch]` `[ref: SDD/Primary Flow: Start Stopwatch]`
  2. Test: Full start-stopwatch flow: list_customers → list_projects → list_services → start_clock → get_running_entry → stop_clock; cache hit on second list call within TTL; error propagation from API client through tool handler to MCP response
  3. Implement: Create integration test that exercises the full flow with mocked HTTP responses. Verify tool responses match SDD output schemas. Verify cache behavior across sequential tool calls.
  4. Validate: Integration tests pass; all previous unit tests still pass
  5. Success: Full flow works end-to-end `[ref: PRD/User Journey/Primary]`; cache reduces API calls `[ref: SDD/ADR-3]`; errors propagate correctly `[ref: SDD/Error Handling]`

- [ ] **T4.3 Build & package** `[activity: project-setup]`

  1. Prime: Read SDD deployment view and MCP client config `[ref: SDD/Deployment View/MCP Client Configuration]`
  2. Test: `npm run build` produces `dist/index.js`; built output runs with `node dist/index.js`
  3. Implement: Verify `tsconfig.json` outputs to `dist/`. Add `"main": "dist/index.js"` to `package.json`. Add `"bin"` field if needed. Ensure `.env.example` documents all required variables.
  4. Validate: Build succeeds; built server starts without errors when env vars are set
  5. Success: Server can be configured in Claude Desktop config `[ref: SDD/Deployment View/MCP Client Configuration]`

- [ ] **T4.4 Final Validation** `[activity: validate]`

  - Run full test suite (`npm test`). Run lint (`npm run lint`). Run typecheck (`npm run typecheck`). Verify all 6 tools work. Verify all PRD acceptance criteria are covered by tests. Verify SDD architecture decisions are reflected in implementation.
