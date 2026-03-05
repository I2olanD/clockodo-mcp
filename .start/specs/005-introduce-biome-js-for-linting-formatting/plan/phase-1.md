---
title: "Phase 1: Biome Setup and Configuration"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Biome Setup and Configuration

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `[ref: SDD/Building Block View; lines: 95-145]` — biome.json configuration and package.json changes
- `[ref: SDD/Architecture Decisions]` — ADR-1 (exact pin), ADR-2 (minimal scripts), ADR-3 (JSON support)

**Key Decisions**:
- Exact version pin for `@biomejs/biome` (ADR-1)
- Two scripts: `lint` and `lint:fix` (ADR-2)
- Include JSON file support (ADR-3)

**Dependencies**:
- None — this is the first phase

---

## Tasks

Establishes working Biome toolchain with correct configuration, replacing the broken ESLint setup.

- [ ] **T1.1 Install Biome and remove ESLint** `[activity: tooling]`

  1. Prime: Read `package.json` current dependencies and scripts `[ref: SDD/Building Block View/package.json Changes]`
  2. Test: Verify `npx biome --version` outputs installed version; verify `eslint` is not in `node_modules`
  3. Implement: Run `npm install --save-dev --save-exact @biomejs/biome@latest` and `npm uninstall eslint`
  4. Validate: `package.json` has `@biomejs/biome` with exact version, no `eslint` in devDependencies
  5. Success: ESLint removed, Biome installed with exact pin `[ref: PRD/Feature 1]` `[ref: SDD/ADR-1]`

- [ ] **T1.2 Create biome.json configuration** `[activity: tooling]`

  1. Prime: Read SDD biome.json specification `[ref: SDD/Building Block View/biome.json Configuration; lines: 97-131]`
  2. Test: Run `npx biome check .` — command executes without configuration errors
  3. Implement: Create `biome.json` at project root with: recommended rules, 2-space indent, double quotes, semicolons, trailing commas, line width 100, VCS integration, import organizing enabled
  4. Validate: `npx biome check .` runs successfully (may report fixable issues — that's expected)
  5. Success: Biome configuration matches existing code style conventions `[ref: PRD/Feature 2, Feature 3]` `[ref: SDD/ADR-3]`

- [ ] **T1.3 Update npm scripts** `[activity: tooling]`

  1. Prime: Read current `package.json` scripts section `[ref: SDD/Building Block View/package.json Changes]`
  2. Test: `npm run lint` executes `biome check .`; `npm run lint:fix` executes `biome check --write .`
  3. Implement: Replace `"lint": "eslint src"` with `"lint": "biome check ."`, add `"lint:fix": "biome check --write ."`
  4. Validate: `npm run lint` runs without error; `npm run lint:fix` runs without error; `npm run typecheck` still works; `npm test -- --run` still passes
  5. Success: All npm scripts work correctly `[ref: PRD/Feature 4]` `[ref: SDD/ADR-2]`

- [ ] **T1.4 Phase Validation** `[activity: validate]`

  - Run `npm run lint`, `npm run typecheck`, `npm test -- --run`. All commands succeed. Verify `npm run lint:fix` applies fixes without breaking tests.
