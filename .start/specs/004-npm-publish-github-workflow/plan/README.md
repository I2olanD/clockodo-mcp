---
title: "Publish clockodo-mcp on npmjs with GitHub Actions"
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
- [ ] Every phase references relevant SDD sections — N/A (SDD skipped)
- [ ] Every test references PRD acceptance criteria — N/A (PRD skipped)
- [x] Integration & E2E tests defined in final phase
- [x] Project commands match actual project setup

---

## Context Priming

*GATE: Read all files in this section before starting any implementation.*

**Specification**:

- `.start/specs/004-npm-publish-github-workflow/plan/README.md` - This plan
- No PRD or SDD (user skipped directly to plan)

**Key Design Decisions**:

- **ADR-1**: Use `files` allowlist in package.json — Only ship `dist/` and metadata files, avoiding `.npmignore` complexity
- **ADR-2**: GitHub Actions publish on tag push — Trigger on `v*` tags for explicit version control
- **ADR-3**: MIT license — Standard open-source license for MCP tools
- **ADR-4**: Exclude test files from dist — Add tsconfig exclude for `*.test.ts` or use a separate tsconfig for build

**Implementation Context**:

```bash
# Testing
npm test                    # Unit tests (vitest)

# Quality
npm run lint               # Linting (eslint)
npm run typecheck          # Type checking (tsc --noEmit)

# Build
npm run build              # Compile TypeScript (tsc)
```

**Current State**:
- package.json: name `clockodo-mcp`, version `0.1.0`, main `dist/index.js`, type `module`
- Build: `tsc` compiles `src/` → `dist/`
- tsconfig: target ES2022, module Node16, outDir `dist`, rootDir `src`
- .gitignore: ignores `node_modules`, `dist`, `.env`, `*.js`
- No LICENSE, no git remote, no .github/ directory
- Test files co-located with source (e.g., `src/cache.test.ts`)
- Package manager: pnpm

---

## Implementation Phases

Each phase is defined in a separate file. Tasks follow red-green-refactor: **Prime** (understand context), **Test** (red), **Implement** (green), **Validate** (refactor + verify).

> **Tracking Principle**: Track logical units that produce verifiable outcomes. The TDD cycle is the method, not separate tracked items.

- [x] [Phase 1: Package Preparation](phase-1.md)
- [x] [Phase 2: GitHub Actions Publish Workflow](phase-2.md)

---

## Plan Verification

Before this plan is ready for implementation, verify:

| Criterion | Status |
|-----------|--------|
| A developer can follow this plan without additional clarification | ✅ |
| Every task produces a verifiable deliverable | ✅ |
| All PRD acceptance criteria map to specific tasks | N/A (skipped) |
| All SDD components have implementation tasks | N/A (skipped) |
| Dependencies are explicit with no circular references | ✅ |
| Parallel opportunities are marked with `[parallel: true]` | ✅ |
| Each task has specification references `[ref: ...]` | ✅ |
| Project commands in Context Priming are accurate | ✅ |
| All phase files exist and are linked from this manifest as `[Phase N: Title](phase-N.md)` | ✅ |
