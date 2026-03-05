---
title: "Phase 1: Package Preparation"
status: completed
version: "1.0"
phase: 1
---

# Phase 1: Package Preparation

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `package.json` — current npm package configuration
- `tsconfig.json` — TypeScript compilation settings
- `.gitignore` — current ignore patterns

**Key Decisions**:
- Use `files` allowlist in package.json instead of `.npmignore`
- Exclude test files from compiled output via separate tsconfig
- MIT license

**Dependencies**:
- None (first phase)

---

## Tasks

Prepares the package for npm publishing: metadata, build configuration, and license.

- [ ] **T1.1 Build configuration for publishing** `[activity: backend-implementation]`

  1. Prime: Read `tsconfig.json` and `package.json` `[ref: tsconfig.json]` `[ref: package.json]`
  2. Test: Run `npm run build` and verify `dist/` contains only production files (no `*.test.js`); run `npm pack --dry-run` and verify only intended files are included
  3. Implement:
     - Add `tsconfig.build.json` that extends `tsconfig.json` and excludes `**/*.test.ts`
     - Update `package.json` build script to use `tsc -p tsconfig.build.json`
     - Add `files` field to `package.json`: `["dist"]`
     - Add `bin` field: `{"clockodo-mcp": "dist/index.js"}`
     - Add shebang `#!/usr/bin/env node` to `src/index.ts`
     - Add `exports` field for proper ESM resolution
  4. Validate: `npm run build` succeeds; `dist/` has no test files; `npm pack --dry-run` shows only `dist/`, `package.json`, `README.md`, `LICENSE`
  5. Success: Package builds cleanly with only production code

- [ ] **T1.2 Package metadata and license** `[parallel: true]` `[activity: backend-implementation]`

  1. Prime: Read `package.json` for current fields `[ref: package.json]`
  2. Test: Run `npm pack --dry-run` and verify package includes LICENSE and has correct metadata
  3. Implement:
     - Add to `package.json`: `description`, `keywords`, `author`, `license` ("MIT"), `repository`, `homepage`
     - Create `LICENSE` file with MIT license text
     - Add `prepublishOnly` script: `"npm run typecheck && npm test -- --run && npm run build"`
  4. Validate: `npm pack --dry-run` shows correct package contents; `npm publish --dry-run` shows no errors
  5. Success: Package has complete npm metadata and MIT license

- [ ] **T1.3 Phase Validation** `[activity: validate]`

  - Run `npm test -- --run`, `npm run lint`, `npm run typecheck`, `npm run build`
  - Run `npm pack --dry-run` — verify tarball contains only: `dist/**/*.js`, `dist/**/*.d.ts` (if declarations enabled), `package.json`, `README.md`, `LICENSE`
  - Verify no test files, no source `.ts` files, no `.env` files in package
