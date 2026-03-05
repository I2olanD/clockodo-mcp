---
title: "Introduce Biome.js for Linting and Formatting"
status: draft
version: "1.0"
---

# Implementation Plan

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All `[NEEDS CLARIFICATION: ...]` markers have been addressed
- [x] All specification file paths are correct and exist
- [x] Each phase follows TDD: Prime → Test → Implement → Validate
- [x] Every task has verifiable success criteria
- [x] A developer could follow this plan independently

### QUALITY CHECKS (Should Pass)

- [x] Context priming section is complete
- [x] All implementation phases are defined with linked phase files
- [x] Dependencies between phases are clear (no circular dependencies)
- [x] Parallel work is properly tagged with `[parallel: true]`
- [x] Activity hints provided for specialist selection `[activity: type]`
- [x] Every phase references relevant SDD sections
- [x] Every test references PRD acceptance criteria
- [x] Integration & E2E tests defined in final phase
- [x] Project commands match actual project setup

---

## Context Priming

*GATE: Read all files in this section before starting any implementation.*

**Specification**:

- `.start/specs/005-introduce-biome-js-for-linting-formatting/requirements.md` - Product Requirements
- `.start/specs/005-introduce-biome-js-for-linting-formatting/solution.md` - Solution Design

**Key Design Decisions**:

- **ADR-1**: Exact version pinning - Pin `@biomejs/biome` to exact version (no caret range)
- **ADR-2**: Minimal script surface - Two scripts only: `lint` (check) and `lint:fix` (write)
- **ADR-3**: Include JSON files - Biome lints and formats JSON files alongside TypeScript

**Implementation Context**:

```bash
# Testing
npm test                    # Unit tests (vitest)

# Quality
npm run lint               # Linting (currently broken, will be replaced)
npm run typecheck          # Type checking (tsc --noEmit)

# Build
npm run build              # TypeScript compilation (tsc -p tsconfig.build.json)
```

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [x] [Phase 1: Biome Setup and Configuration](phase-1.md)
- [x] [Phase 2: Codebase Formatting and Final Validation](phase-2.md)

---

## Plan Verification

Before this plan is ready for implementation, verify:

| Criterion | Status |
|-----------|--------|
| A developer can follow this plan without additional clarification | ✅ |
| Every task produces a verifiable deliverable | ✅ |
| All PRD acceptance criteria map to specific tasks | ✅ |
| All SDD components have implementation tasks | ✅ |
| Dependencies are explicit with no circular references | ✅ |
| Parallel opportunities are marked with `[parallel: true]` | ✅ |
| Each task has specification references `[ref: ...]` | ✅ |
| Project commands in Context Priming are accurate | ✅ |
| All phase files exist and are linked from this manifest as `[Phase N: Title](phase-N.md)` | ✅ |
