---
title: "Phase 2: Codebase Formatting and Final Validation"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: Codebase Formatting and Final Validation

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Runtime View]` — auto-fix flow and error handling
- `[ref: SDD/Acceptance Criteria]` — all system-level acceptance criteria
- `[ref: SDD/Risks and Technical Debt/Implementation Gotchas]` — first-run formatting expectations

**Key Decisions**:
- First formatting run should be a separate commit from the tooling setup (SDD gotcha)

**Dependencies**:
- Phase 1 must be complete (Biome installed and configured)

---

## Tasks

Applies Biome formatting to the entire codebase and validates that all PRD acceptance criteria are met.

- [ ] **T2.1 Apply Biome auto-fix to codebase** `[activity: tooling]`

  1. Prime: Read SDD implementation gotchas — first run will reformat files `[ref: SDD/Risks and Technical Debt/Implementation Gotchas]`
  2. Test: After fix, `npm run lint` exits with code 0 (no remaining issues)
  3. Implement: Run `npm run lint:fix` to apply formatting, import sorting, and safe lint fixes across all files
  4. Validate: `npm run lint` exits 0; `npm run typecheck` passes; `npm test -- --run` passes; review diff to confirm changes are formatting-only
  5. Success: All source files pass Biome checks `[ref: PRD/Feature 1, Feature 2, Feature 3, Feature 4]`

- [ ] **T2.2 End-to-end validation** `[activity: validate]`

  1. Prime: Read PRD acceptance criteria and SDD acceptance criteria `[ref: PRD/Feature Requirements]` `[ref: SDD/Acceptance Criteria]`
  2. Test: Verify each acceptance criterion:
     - `npm run lint` checks all `.ts` and `.json` files `[ref: PRD/AC Feature 1]`
     - `npm run lint` exits 0 on clean code, non-zero on issues `[ref: SDD/Main Flow Criteria]`
     - `npm run lint:fix` auto-fixes formatting and import order `[ref: PRD/AC Feature 2, Feature 3]`
     - No ESLint dependencies remain in `package.json` `[ref: SDD/Migration Criteria]`
     - `prepublishOnly` script still works: `npm run typecheck && npm test -- --run && npm run build` `[ref: SDD/Migration Criteria]`
     - `.gitignore` is respected (dist/, node_modules/ excluded) `[ref: SDD/Configuration Criteria]`
  3. Implement: Fix any remaining issues discovered during validation
  4. Validate: All checks green — lint, typecheck, test, build
  5. Success: All PRD and SDD acceptance criteria verified `[ref: PRD/all features]` `[ref: SDD/all acceptance criteria]`
