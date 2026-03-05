---
title: "Add and Edit Time Entries"
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

- `.start/specs/002-add-edit-time-entries/requirements.md` - Product Requirements
- `.start/specs/002-add-edit-time-entries/solution.md` - Solution Design

**Key Design Decisions**:

- **ADR-1**: Follow existing tool pattern — handler + register split for each tool, same as all 6 existing tools
- **ADR-2**: Duration in minutes — tool accepts `duration_minutes`, converts to `time_since`/`time_until` for the API
- **ADR-3**: Extend Entry interface — add `billable` field, add `CreateEntryParams` and `UpdateEntryParams`
- **ADR-4**: No caching for writes — `createEntry` and `updateEntry` always hit the API

**Implementation Context**:

```bash
# Testing
pnpm test                   # Unit tests (vitest)

# Quality
pnpm run lint               # ESLint
pnpm run typecheck          # tsc --noEmit

# Build
pnpm run build              # tsc → dist/
```

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [x] [Phase 1: Core Infrastructure](phase-1.md)
- [x] [Phase 2: Tool Implementations](phase-2.md)
- [x] [Phase 3: Integration & Validation](phase-3.md)

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
