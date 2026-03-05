---
title: "Add and Edit Time Entries"
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

## Output Schema

### PRD Status Report

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| specId | string | Yes | Spec identifier (NNN-name format) |
| title | string | Yes | Feature title |
| status | enum: `DRAFT`, `IN_REVIEW`, `COMPLETE` | Yes | Document readiness |
| sections | SectionStatus[] | Yes | Status of each PRD section |
| clarificationsRemaining | number | Yes | Count of `[NEEDS CLARIFICATION]` markers |
| acceptanceCriteria | number | Yes | Total testable acceptance criteria defined |
| openQuestions | string[] | No | Unresolved items requiring stakeholder input |

### SectionStatus

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Section name |
| status | enum: `COMPLETE`, `NEEDS_CLARIFICATION`, `IN_PROGRESS` | Yes | Current state |
| detail | string | No | What clarification is needed or what's in progress |

---

## Product Overview

### Vision

Enable AI assistants using the Clockodo MCP server to create and edit completed time entries directly, so users can log past work (e.g., "Add a 30 minute entry for inNFactory / FIO Nachbesprechung") without using the Clockodo web UI.

### Problem Statement

Currently, the Clockodo MCP server only supports real-time clock operations (start/stop a stopwatch). Users who forget to start the clock, attend meetings without tracking, or need to log work retroactively must leave their AI assistant workflow and manually create entries in the Clockodo web interface. This context-switching interrupts productivity and leads to incomplete or delayed time tracking.

### Value Proposition

By adding entry creation and editing tools to the MCP server, users can log past work and correct entries entirely through natural language commands to their AI assistant. This eliminates context-switching to the Clockodo web UI and makes time tracking faster and more complete.

## User Personas

### Primary Persona: Knowledge Worker Using AI Assistant

- **Demographics:** Developer, consultant, or project manager aged 25-55 who uses Claude Desktop or Cursor as their primary AI assistant. Moderate technical expertise.
- **Goals:** Track all billable and internal work accurately with minimal friction. Stay in the AI assistant workflow without switching to the Clockodo web UI.
- **Pain Points:** Forgets to start the clock before meetings. Needs to log work retroactively at end of day. Context-switching to the Clockodo web UI breaks flow. Fixing entry errors (wrong duration, typo in description) requires navigating the web interface.

## User Journey Maps

### Primary User Journey: Log Past Work

1. **Awareness:** User finishes a meeting or task and realizes they didn't track time for it.
2. **Consideration:** User could open the Clockodo web UI, but prefers to stay in the AI assistant.
3. **Adoption:** User asks the AI assistant: "Add a 30 minute entry for inNFactory intern / FIO Nachbesprechung."
4. **Usage:** The AI assistant resolves customer/project/service IDs using existing list tools, then calls `add_entry` with the resolved IDs, duration, and description. The entry is created and confirmed.
5. **Retention:** User habitually logs all retroactive entries through the AI assistant because it's faster than the web UI.

### Secondary User Journey: Fix an Entry Error

1. **Awareness:** User notices they logged incorrect duration or description on a recent entry.
2. **Usage:** User asks the AI assistant: "Change the duration of entry 12345 to 45 minutes." The AI assistant calls `edit_entry` with the corrected field.
3. **Retention:** User trusts the AI assistant for both creating and correcting entries.

## Feature Requirements

### Must Have Features

#### Feature 1: Add Time Entry

- **User Story:** As a knowledge worker, I want to create a completed time entry with a customer, service, duration, and description so that I can log past work without leaving my AI assistant.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a valid customer ID and service ID, When the user creates an entry with a duration of 30 minutes and a description, Then a completed entry is created in Clockodo with the correct customer, service, duration (1800 seconds), and description
  - [x] Given a valid customer ID, service ID, and project ID, When the user creates an entry, Then the entry is associated with the specified project
  - [x] Given no billable flag is provided, When the user creates an entry, Then the entry defaults to billable (billable=1)
  - [x] Given the user provides billable=false, When the entry is created, Then the entry is marked as non-billable (billable=0)
  - [x] Given a duration of 30 minutes, When the entry is created, Then `time_until` is set to the current time and `time_since` is set to 30 minutes before `time_until`
  - [x] Given an invalid customer ID or service ID, When the user attempts to create an entry, Then an error message is returned describing the problem

#### Feature 2: Edit Time Entry

- **User Story:** As a knowledge worker, I want to edit an existing time entry so that I can correct mistakes in duration, description, customer, service, or project without using the Clockodo web UI.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a valid entry ID and a new duration, When the user edits the entry, Then the entry's duration is updated to the new value
  - [x] Given a valid entry ID and a new description, When the user edits the entry, Then the entry's text is updated
  - [x] Given a valid entry ID and a new customer ID, When the user edits the entry, Then the entry's customer is changed
  - [x] Given a valid entry ID and a new project ID, When the user edits the entry, Then the entry's project is changed
  - [x] Given an invalid entry ID, When the user attempts to edit, Then an error message is returned
  - [x] Given no optional fields are provided besides entry_id, When the user calls edit, Then an error is returned indicating at least one field must be provided

### Should Have Features

#### Feature 3: Billable Override on Edit

- **User Story:** As a knowledge worker, I want to change the billable status of an existing entry so that I can correct billing mistakes.
- **Acceptance Criteria:**
  - [x] Given a valid entry ID and billable=true, When the user edits the entry, Then the entry's billable status is updated to 1
  - [x] Given a valid entry ID and billable=false, When the user edits the entry, Then the entry's billable status is updated to 0

### Could Have Features

#### Feature 4: Custom Start Time

- **User Story:** As a knowledge worker, I want to specify a start time when creating an entry so that entries appear at the correct position in my timeline.
- **Acceptance Criteria:**
  - [x] Given a start time and duration, When the user creates an entry, Then `time_since` is set to the provided start time and `time_until` is calculated from start time + duration

### Won't Have (This Phase)

- **Delete entries** — Destructive operation; out of scope for initial release
- **List/search entries** — Complex filtering; users can use the Clockodo web UI for browsing
- **Bulk entry creation** — Single entry at a time is sufficient
- **Lump sum entries** — Only time-based entries are supported
- **Subproject assignment** — Rarely used; not needed for initial release
- **User assignment** — Entries are always for the authenticated user

## Detailed Feature Specifications

### Feature: Add Time Entry

**Description:** Creates a completed time entry in Clockodo with a calculated time window based on the provided duration in minutes. The entry is anchored to the current time (time_until = now, time_since = now - duration).

**User Flow:**
1. User asks AI assistant to log a past entry (e.g., "Add a 30 min entry for inNFactory / FIO Nachbesprechung").
2. AI assistant resolves customer/project/service names to IDs using existing list tools.
3. AI assistant calls `add_entry` with resolved IDs, duration in minutes, and description.
4. System converts duration from minutes to seconds, calculates time window, and calls the Clockodo API.
5. System returns confirmation with the created entry details.

**Business Rules:**
- Rule 1: Duration is provided in minutes and converted to seconds for the API (duration_minutes * 60).
- Rule 2: When no explicit start time is provided, `time_until` is set to the current UTC time and `time_since` is calculated as `time_until - duration`.
- Rule 3: Billable defaults to `true` (billable=1) if not explicitly set.
- Rule 4: `customers_id` and `services_id` are always required. `projects_id` and `text` are optional.
- Rule 5: `text` (description) is limited to 1000 characters.

**Edge Cases:**
- Duration of 0 minutes → Accepted (Clockodo API allows duration=0).
- Very large duration (e.g., 1440 minutes = 24 hours) → Pass through to API; let Clockodo enforce its own limits.
- Missing customer or service → Return clear error before calling the API.

### Feature: Edit Time Entry

**Description:** Updates one or more fields of an existing time entry. Only the provided fields are sent to the API; unchanged fields are preserved.

**User Flow:**
1. User asks AI assistant to correct an entry (e.g., "Change entry 12345 duration to 45 minutes").
2. AI assistant calls `edit_entry` with the entry ID and changed fields.
3. System sends only the changed fields to the Clockodo API.
4. System returns confirmation with the updated entry details.

**Business Rules:**
- Rule 1: At least one field besides `entry_id` must be provided.
- Rule 2: If `duration_minutes` is provided, it is converted to seconds for the API.
- Rule 3: All fields are optional except `entry_id`.

**Edge Cases:**
- Entry does not exist → Return the API error message.
- Entry belongs to a different user → Return the API error (permission denied).
- No fields provided besides entry_id → Return validation error before calling the API.

## Success Metrics

### Key Performance Indicators

- **Adoption:** The `add_entry` and `edit_entry` tools are invoked by the AI assistant during time tracking conversations.
- **Engagement:** Users create entries through the MCP server instead of the Clockodo web UI.
- **Quality:** Error rate for entry creation is below 5% (caused by invalid IDs, not user error).
- **Business Impact:** More complete time tracking — fewer missed entries at end of day.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| Entry created via MCP | customers_id, services_id, duration_minutes, has_project, has_text | Track usage patterns for add_entry |
| Entry edited via MCP | entry_id, fields_changed | Track which fields are most commonly corrected |
| Entry creation error | error_type, status_code | Monitor API error rates |
| Entry edit error | error_type, status_code | Monitor API error rates |

Note: Tracking is implicit through Clockodo's own audit log. No additional tracking infrastructure is needed in the MCP server.

---

## Constraints and Assumptions

### Constraints

- Must use the existing Clockodo REST API v2 (`/v2/entries` endpoint)
- Must follow the established MCP tool pattern (handler + register functions, Zod schemas)
- Must maintain backward compatibility with existing tools (no changes to list or clock tools)
- Authentication uses the same API key/email as existing tools

### Assumptions

- The Clockodo API's `POST /v2/entries` endpoint accepts `time_since` + `time_until` for creating completed entries (not just duration alone)
- The authenticated user has permission to create and edit their own entries
- The AI assistant handles name-to-ID resolution using existing list tools before calling add/edit entry tools
- Users primarily need to log entries for the current day or recent past

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Clockodo API rejects entries with calculated time windows | High | Low | Test with real API during integration; fall back to duration-only if needed |
| Users provide invalid customer/project/service IDs | Medium | Medium | Return clear error messages; AI assistant resolves names to IDs first |
| Time zone mismatches in calculated time_since/time_until | Medium | Low | Use UTC consistently; document that times are in UTC |
| Entry edit modifies wrong entry (incorrect ID) | High | Low | Entry ID is explicitly provided by user or AI; no ambiguous resolution |

## Open Questions

None — all questions resolved during brainstorming.

---

## Supporting Research

### Competitive Analysis

Clockodo's own web UI and desktop app support full entry CRUD. Other MCP time-tracking integrations (Toggl, Harvest) typically offer both real-time tracking and retroactive entry creation. Adding entry creation brings feature parity with these alternatives.

### User Research

The feature request originated from a real user scenario: logging a 30-minute meeting ("FIO Nachbesprechung") for a specific customer ("inNFactory") and service ("interne Arbeitszeit") after the fact. This represents the most common retroactive time tracking need.

### Market Data

Time tracking tools consistently report that retroactive entry creation accounts for 30-60% of all entries (assumption based on industry patterns — not measured data specific to this user). Supporting this use case is critical for complete time tracking coverage.
