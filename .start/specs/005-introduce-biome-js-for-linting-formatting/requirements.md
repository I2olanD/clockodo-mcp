---
title: "Introduce Biome.js for Linting and Formatting"
status: draft
version: "1.0"
---

# Product Requirements Document

## Validation Checklist

### CRITICAL GATES (Must Pass)

- [x] All required sections are complete
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Problem statement is specific and measurable
- [x] Every feature has testable acceptance criteria (Gherkin format)
- [x] No contradictions between sections

### QUALITY CHECKS (Should Pass)

- [x] Problem is validated by evidence (not assumptions)
- [x] Context → Problem → Solution flow makes sense
- [x] Every persona has at least one user journey
- [x] All MoSCoW categories addressed (Must/Should/Could/Won't)
- [x] Every metric has corresponding tracking events
- [x] No feature redundancy (check for duplicates)
- [x] No technical implementation details included
- [x] A new team member could understand this PRD

---

## Product Overview

### Vision

A single, fast, zero-config tool that enforces consistent code style and catches bugs across the entire codebase — replacing the current broken linting setup with Biome.js.

### Problem Statement

The project currently has ESLint v9 installed but **completely unconfigured** — no `eslint.config.js` exists, so `npm run lint` fails with an error. There is no code formatter (no Prettier). This means:

- **Zero automated code quality checks** — bugs that linting would catch go undetected.
- **No formatting consistency** — code style varies by contributor and IDE settings.
- **Broken developer experience** — running `npm run lint` produces an error instead of useful feedback.
- **No import organization** — imports accumulate in arbitrary order.

### Value Proposition

Biome.js provides a unified linting, formatting, and import sorting tool in a single dependency with a single config file. It is 10-25x faster than ESLint + Prettier and requires minimal configuration. Since the current ESLint setup is non-functional, there is zero migration cost — this is a clean-slate setup.

## User Personas

### Primary Persona: Project Developer

- **Demographics:** Software developer working on the clockodo-mcp project, familiar with TypeScript and Node.js tooling.
- **Goals:** Write consistent, high-quality code with fast feedback from tooling. Run a single command to check and fix code style and quality issues.
- **Pain Points:** `npm run lint` is broken. No automated formatting means manual style enforcement. No way to catch common bugs before committing.

## User Journey Maps

### Primary User Journey: Daily Development Workflow

1. **Awareness:** Developer runs `npm run lint` and sees it is broken, or notices inconsistent formatting across files.
2. **Consideration:** Developer evaluates fixing ESLint config vs. adopting Biome.js. Biome offers unified linting + formatting in one tool with minimal setup.
3. **Adoption:** Developer installs Biome, runs `biome init`, and immediately gets working linting and formatting.
4. **Usage:** Developer runs `npm run check` to verify code quality, `npm run check -- --write` to auto-fix issues. Integrates with IDE for real-time feedback.
5. **Retention:** Fast execution (sub-second for this codebase), single config file, and combined lint+format keeps the workflow simple and reliable.

## Feature Requirements

### Must Have Features

#### Feature 1: Code Linting

- **User Story:** As a developer, I want automated code linting so that common bugs and anti-patterns are caught before they reach production.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the project has TypeScript source files, When the developer runs the lint command, Then all source files are analyzed for correctness, style, and suspicious patterns
  - [x] Given a source file contains an unused variable, When the developer runs the lint command, Then the unused variable is reported as an error
  - [x] Given a source file contains no issues, When the developer runs the lint command, Then the command exits with code 0 and no warnings or errors

#### Feature 2: Code Formatting

- **User Story:** As a developer, I want automated code formatting so that all files follow a consistent style without manual effort.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a source file has inconsistent indentation or spacing, When the developer runs the format command with write mode, Then the file is reformatted to match the project style
  - [x] Given all source files are already formatted correctly, When the developer runs the format check command, Then the command exits with code 0
  - [x] Given a source file uses single quotes, When formatting is applied, Then single quotes are preserved (or replaced per project convention — to be configured)

#### Feature 3: Import Sorting

- **User Story:** As a developer, I want imports to be automatically organized so that import sections are consistent and easy to scan.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a source file has unorganized imports, When the developer runs the check command with write mode, Then imports are sorted into a consistent order
  - [x] Given a source file has already-sorted imports, When the developer runs the check command, Then no changes are reported for imports

#### Feature 4: Unified Check Command

- **User Story:** As a developer, I want a single command that runs linting, formatting, and import sorting together so that I don't need to remember multiple commands.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the developer runs `npm run check`, When the command completes, Then linting, formatting, and import sorting issues are all reported in a single output
  - [x] Given the developer runs the check command with a write/fix flag, When the command completes, Then all auto-fixable issues across linting, formatting, and imports are resolved

### Should Have Features

#### Feature 5: IDE Integration Guidance

- **User Story:** As a developer, I want to know how to configure my editor to use Biome so that I get real-time feedback while coding.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the project README or contributing guide exists, When Biome is set up, Then instructions for VS Code Biome extension setup are documented

### Could Have Features

#### Feature 6: Pre-commit Hook

- **User Story:** As a developer, I want code to be automatically checked before each commit so that poorly formatted or buggy code never enters the repository.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the developer stages files and runs `git commit`, When a pre-commit hook is configured, Then only staged files are checked by Biome before the commit proceeds

### Won't Have (This Phase)

- **CI/CD integration** — No GitHub Actions workflow exists yet; adding CI is a separate spec (004).
- **Custom rule authoring** — Biome's built-in recommended rules are sufficient for this project.
- **Monorepo configuration** — This is a single-package project.
- **Migration of existing ESLint rules** — There are no existing rules to migrate.

## Detailed Feature Specifications

### Feature: Unified Check Command

**Description:** A single npm script that runs Biome's combined check (lint + format + import sort) across all source files. Supports both a read-only mode for verification and a write mode for auto-fixing.

**User Flow:**
1. Developer modifies source files
2. Developer runs `npm run check` to see all issues
3. Developer runs `npm run check -- --write` to auto-fix issues (or runs fix command directly)
4. Developer reviews any remaining issues that require manual attention

**Business Rules:**
- Rule 1: The check command must cover all `.ts` files in the `src` directory
- Rule 2: The check command must report issues from all three domains (lint, format, imports) in a single run
- Rule 3: Auto-fix must only apply safe fixes by default (no unsafe transformations without explicit opt-in)

**Edge Cases:**
- Scenario 1: A file has both lint errors and formatting issues → Expected: Both are reported; formatting is auto-fixed while lint errors that can't be safely fixed are reported for manual resolution
- Scenario 2: A non-TypeScript file (e.g., JSON) is in the source directory → Expected: Biome handles JSON formatting if configured, or ignores it gracefully

## Success Metrics

### Key Performance Indicators

- **Adoption:** 100% — all developers on the project use Biome for linting and formatting (single-developer project currently).
- **Engagement:** Every code change is checked before commit (manual or via hook).
- **Quality:** Zero broken lint command invocations — `npm run lint` and `npm run check` always execute successfully.
- **Business Impact:** Reduced code review friction from style inconsistencies; earlier bug detection.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| `npm run check` exit code | exit code (0 or non-zero) | Verify the check command works reliably |
| Biome rule violations found | rule name, severity, file | Understand which rules catch the most issues |
| Auto-fix success rate | issues fixed vs. reported | Confirm auto-fix handles the majority of issues |

---

## Constraints and Assumptions

### Constraints

- Must work with Node.js and the existing `package.json` scripts structure.
- Must support TypeScript 5.7+ and ES2022 target.
- Single dependency preferred — avoid adding Biome *and* keeping ESLint.

### Assumptions

- The recommended Biome rule set is sufficient for this project's needs (no custom rules required).
- Biome's TypeScript support covers all language features used in this codebase.
- The project will remain a single-package repository (no monorepo considerations).

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Biome missing a lint rule the project later needs | Medium | Low | Biome has 455+ rules; evaluate specific needs if they arise and supplement with `tsc --noEmit` for type checking |
| Biome formatting differs from team preferences | Low | Medium | Configure `biome.json` formatting options (quotes, semicolons, indent) to match team conventions |
| IDE extension not available for developer's editor | Low | Low | Biome supports VS Code, IntelliJ, and CLI fallback; covers common editors |

## Open Questions

- [x] Full ESLint replacement vs. gradual adoption? → **Decided: Full replacement**
- [x] Include import sorting? → **Decided: Yes**
- [ ] Specific formatting preferences (single vs. double quotes, tabs vs. spaces, semicolons)? → To be configured during implementation

---

## Supporting Research

### Competitive Analysis

| Tool | Speed | Unified | Config Complexity | TypeScript |
|------|-------|---------|-------------------|------------|
| ESLint + Prettier | Baseline | No (2 tools, 2 configs) | High (plugins, parsers, configs) | Via plugin |
| Biome.js | 10-25x faster | Yes (lint + format + imports) | Low (single JSON file) | Native |
| dprint | Fast | Formatting only | Low | Formatting only |

### User Research

Developer experience observation: `npm run lint` currently fails with a configuration error. This is the most direct evidence that the current setup needs replacement rather than repair.

### Market Data

Biome.js has seen rapid adoption since 2024, with major projects migrating from ESLint + Prettier. The unified toolchain approach reduces dependency count (1 package vs. 5-10+ for ESLint ecosystem) and eliminates configuration conflicts between linter and formatter.
