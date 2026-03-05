---
title: "Phase 2: GitHub Actions Publish Workflow"
status: completed
version: "1.0"
phase: 2
---

# Phase 2: GitHub Actions Publish Workflow

## Phase Context

**GATE**: Read all referenced files before starting this phase.

**Specification References**:
- `package.json` — updated in Phase 1 with build and metadata
- `.github/workflows/` — to be created

**Key Decisions**:
- Trigger on `v*` tag push (e.g., `v0.1.0`)
- Use `NPM_TOKEN` secret for authentication
- Run full test suite before publishing
- Use pnpm in CI (matches local setup)

**Dependencies**:
- Phase 1 must be complete (package must be publishable)

---

## Tasks

Creates a GitHub Actions workflow that publishes the package to npm when a version tag is pushed.

- [ ] **T2.1 CI test workflow** `[activity: backend-implementation]`

  1. Prime: Read `package.json` scripts section `[ref: package.json]`
  2. Test: Verify workflow YAML is valid; verify it runs on push to main and PRs
  3. Implement: Create `.github/workflows/ci.yml`:
     - Trigger: push to `main`, pull requests to `main`
     - Steps: checkout, setup Node.js (lts), setup pnpm, install dependencies, typecheck, lint, test (`--run` flag for non-watch mode), build
  4. Validate: YAML is valid; workflow covers all quality gates
  5. Success: CI workflow runs tests, lint, typecheck, and build on every push/PR

- [ ] **T2.2 npm publish workflow** `[activity: backend-implementation]`

  1. Prime: Read GitHub Actions docs for npm publishing; read `package.json` `[ref: package.json]`
  2. Test: Verify workflow YAML is valid; verify it triggers only on `v*` tags; verify it uses `NPM_TOKEN` secret
  3. Implement: Create `.github/workflows/publish.yml`:
     - Trigger: push tags matching `v*`
     - Steps: checkout, setup Node.js (lts) with registry-url `https://registry.npmjs.org`, setup pnpm, install dependencies, typecheck, test (`--run`), build, publish (`pnpm publish --no-git-checks`)
     - Environment variable: `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`
  4. Validate: YAML syntax valid; publish step uses correct auth; version tag pattern correct
  5. Success: Workflow publishes to npm on tag push with full quality gates

- [ ] **T2.3 Phase Validation** `[activity: validate]`

  - Review both workflow files for correct YAML syntax
  - Verify CI workflow triggers on push/PR to main
  - Verify publish workflow triggers only on `v*` tags
  - Verify publish workflow runs quality gates before `npm publish`
  - Verify `NPM_TOKEN` secret is referenced (user must add this to GitHub repo settings)
  - Document setup instructions: how to add `NPM_TOKEN` secret and how to trigger a release (`git tag v0.1.0 && git push --tags`)
