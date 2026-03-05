---
title: "Custom Start Time for Time Entries"
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

Enable knowledge workers to log time entries at the exact time they occurred, not just when they remember to log them.

### Problem Statement

When users add time entries via the MCP tool, every entry is anchored to the current moment (`time_until = now`). Users who want to log a past meeting at its actual time (e.g., "the 10:00-10:30 standup I had this morning") cannot do so — the entry always appears at "now" in their Clockodo timeline. This forces users to either:

1. Switch to the Clockodo web UI to manually set the correct time (breaking their AI assistant workflow).
2. Accept inaccurate timestamps in their time log (reducing report accuracy).
3. Use the `edit_entry` tool to adjust duration after the fact (which still cannot reposition the entry on the timeline).

In spec-002, this was identified as a "Could Have" feature (Feature 4: Custom Start Time) with clear user demand.

### Value Proposition

Users can log entries at their actual occurrence time without leaving the AI assistant. A single optional parameter (`start_time`) preserves the existing simple workflow for quick entries while unlocking precise time placement for retroactive and pre-planned logging.

## User Personas

### Primary Persona: Knowledge Worker (from spec-002)

- **Demographics:** Age 25-55, professional role (developer, consultant, project manager), comfortable with AI tools, tracks billable hours daily.
- **Goals:** Maintain an accurate time log that reflects when work actually happened. Minimize context-switching between tools. Log multiple past entries efficiently at end of day.
- **Pain Points:** Forgetting to start the timer means entries land at the wrong time. Reconstructing the day's timeline in the Clockodo web UI is tedious. The AI assistant workflow breaks when precise time placement is needed.

## User Journey Maps

### Primary User Journey: Retroactive Time Logging

1. **Awareness:** User finishes a meeting at 10:30 AM but doesn't log it until 2:00 PM.
2. **Consideration:** User could log via Clockodo web UI (slow, context switch) or via AI assistant (fast, but currently imprecise).
3. **Adoption:** User tells the AI assistant: "Log 30 minutes for the standup from 10:00 to 10:30 today."
4. **Usage:** The AI assistant converts the natural language to `start_time = "2026-03-05T10:00:00+01:00"` and `duration_minutes = 30`, then calls `add_entry`. The entry appears at 10:00-10:30 in Clockodo.
5. **Retention:** User trusts the AI assistant for all time logging, eliminating the need to visit the Clockodo web UI.

### Secondary User Journey: End-of-Day Batch Logging

1. **Awareness:** User reaches end of day with no entries logged.
2. **Usage:** User tells the AI assistant to log 4-5 entries with specific times from memory: "9:00-10:00 sprint planning, 10:30-11:00 code review, 13:00-14:30 feature development..."
3. **Retention:** The batch logging experience is faster than the web UI, reinforcing the AI assistant workflow.

## Feature Requirements

### Must Have Features

#### Feature 1: Custom Start Time Parameter

- **User Story:** As a knowledge worker, I want to specify a start time when creating a time entry so that the entry appears at the correct position in my Clockodo timeline.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given a valid `start_time` ISO 8601 datetime and `duration_minutes`, When the user creates an entry, Then `time_since` is set to the provided `start_time` (normalized to UTC) and `time_until` is calculated as `start_time + duration_minutes`
  - [x] Given `start_time` is not provided, When the user creates an entry with `duration_minutes`, Then the existing behavior is preserved exactly (`time_until = now`, `time_since = now - duration`)
  - [x] Given `start_time` includes a timezone offset (e.g., `+01:00`), When the entry is created, Then the time is correctly normalized to UTC before being sent to the Clockodo API
  - [x] Given `start_time = "2026-03-05T23:45:00Z"` and `duration_minutes = 30`, When the entry is created, Then the entry correctly spans midnight (`time_since = 23:45, time_until = 00:15 next day`)
  - [x] Given `start_time` and `duration_minutes = 0`, When the entry is created, Then `time_since = time_until = start_time` (zero-duration entry)

#### Feature 2: Backward Compatibility

- **User Story:** As a knowledge worker who uses the existing quick-entry workflow, I want the tool to work exactly as before when I don't provide a start time, so that my existing workflow is not disrupted.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given no `start_time` parameter is provided, When `add_entry` is called with `duration_minutes`, Then the entry is created with `time_until = now` and `time_since = now - duration` (identical to current behavior)
  - [x] Given no `start_time` parameter is provided, When the tool schema is inspected, Then `start_time` appears as an optional parameter with a clear description

### Should Have Features

#### Feature 3: Descriptive Tool Schema

- **User Story:** As an AI assistant, I want the `start_time` parameter description to clearly explain its format and default behavior so that I can correctly construct tool calls from user natural language.
- **Acceptance Criteria (Gherkin Format):**
  - [x] Given the tool schema, When the AI assistant reads the `start_time` parameter description, Then it contains: the expected format (ISO 8601), an example value, and the default behavior when omitted

### Could Have Features

None for this specification — the scope is intentionally narrow.

### Won't Have (This Phase)

- **Explicit `end_time` parameter:** Users cannot specify both start and end times independently. Duration is always required. The AI model converts "10:00-10:30" to `start_time + duration_minutes`.
- **Relative date strings:** The tool will not parse "tomorrow" or "yesterday". The AI model resolves natural language to ISO 8601 before calling the tool.
- **Separate `date` and `time` parameters:** A single `start_time` ISO 8601 datetime is used instead of split parameters.
- **Recurring entries:** No support for creating multiple entries from a pattern (e.g., "every Monday at 10:00").

## Detailed Feature Specifications

### Feature: Custom Start Time Parameter

**Description:** Adds an optional `start_time` parameter to the `add_entry` MCP tool. When provided, the entry's time window is anchored to the given start time instead of the current moment. The `duration_minutes` parameter remains required and determines `time_until` by adding the duration to `start_time`.

**User Flow:**
1. User tells the AI assistant to log time at a specific time (e.g., "log 30 minutes for the standup from 10:00 to 10:30 today").
2. The AI assistant resolves the natural language to an ISO 8601 `start_time` and `duration_minutes`.
3. The AI assistant calls `add_entry` with `start_time`, `duration_minutes`, and other required fields.
4. The tool calculates `time_since = start_time` and `time_until = start_time + duration`.
5. The entry is created in Clockodo at the specified time position.

**Business Rules:**
- Rule 1: When `start_time` is provided, `time_since = start_time` and `time_until = start_time + duration_minutes`.
- Rule 2: When `start_time` is not provided, the current behavior applies: `time_until = now`, `time_since = now - duration_minutes`.
- Rule 3: `start_time` must be a valid ISO 8601 datetime string (with or without timezone offset). Invalid strings are rejected at the schema validation level.
- Rule 4: Timezone offsets in `start_time` are normalized to UTC before being sent to the Clockodo API.
- Rule 5: Milliseconds are stripped from all timestamps before API submission (consistent with existing behavior).
- Rule 6: Future-dated entries are passed through to the Clockodo API without local validation. If the API rejects them, the error is returned to the user.

**Edge Cases:**
- Midnight crossover: Entry spanning two calendar days (e.g., 23:45 + 30 min = 00:15 next day) → Expected: Both timestamps calculated correctly, no local rejection.
- Zero duration with custom start: `start_time` provided, `duration_minutes = 0` → Expected: `time_since = time_until = start_time`.
- Future date: `start_time` in the future → Expected: Passed through to API; error returned if API rejects.
- Invalid ISO string (e.g., "tomorrow at 10am") → Expected: Zod validation rejects before handler runs.
- Offset-aware string (e.g., `+01:00`) → Expected: Normalized to UTC via standard Date parsing.

## Success Metrics

### Key Performance Indicators

- **Adoption:** Users successfully create entries with custom `start_time` (vs. default "now" anchoring).
- **Engagement:** Ratio of entries created with `start_time` vs. without, indicating demand for precise time placement.
- **Quality:** No increase in API error rate after feature launch. Custom-time entries have the same success rate as default entries.
- **Business Impact:** Reduced need for users to switch to the Clockodo web UI for time entry corrections.

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| `entry_created` | `has_custom_start_time: boolean` | Measure adoption of custom time feature |
| `entry_created_error` | `error_type`, `has_custom_start_time` | Identify if custom times cause more API errors |

---

## Constraints and Assumptions

### Constraints

- The Clockodo API requires `time_since` and `time_until` as ISO 8601 UTC strings without milliseconds for `POST /v2/entries`.
- The MCP tool communicates via structured JSON-RPC; the AI model is responsible for converting natural language dates to ISO 8601.
- The `edit_entry` endpoint (`PUT /v2/entries/{id}`) uses `duration` in seconds, not `time_since`/`time_until`. This feature only affects `add_entry`.

### Assumptions

- The AI model (Claude) can reliably convert natural language time expressions ("tomorrow at 10am", "yesterday from 2-3pm") to ISO 8601 datetime strings, given the user's timezone context.
- The Clockodo API accepts entries with `time_since` in the past (retroactive logging). This is confirmed by the existing behavior where `time_since = now - duration` can be arbitrarily far in the past.
- The Clockodo API's behavior for future-dated entries is unknown. The tool will pass through without local validation.

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI model sends incorrect timezone, placing entry at wrong time | Medium | Medium | Clear parameter description with format examples; UTC normalization in tool |
| Clockodo API rejects future-dated entries | Low | Low | Pass through to API; return clear error message; document limitation if confirmed |
| Users confused by ISO 8601 format requirement | Low | Low | The AI model handles format conversion; users interact in natural language |

## Open Questions

- [x] Does the Clockodo API accept future-dated entries? → Decision: Pass through without local validation; let API enforce its own rules.
- [x] Should `start_time` accept date-only strings (e.g., `"2026-03-06"`)? → Decision: No. Full ISO 8601 datetime required. AI model defaults time to `T00:00:00Z` if user specifies only a date.

---

## Supporting Research

### Competitive Analysis

Time tracking tools (Toggl, Harvest, Clockify) all support retroactive entry creation with custom start/end times as a core feature. The Clockodo web UI itself supports this. The MCP tool is the only entry point that lacks this capability.

### User Research

Spec-002 identified "Custom Start Time" as a "Could Have" feature (Feature 4) based on the primary user story: "As a knowledge worker, I want to specify a start time when creating an entry so that entries appear at the correct position in my timeline." The current conversation confirms direct user demand for this feature.

### Market Data

MCP (Model Context Protocol) tools are designed to give AI assistants structured access to external services. The value proposition of an MCP tool decreases when users must fall back to the web UI for common operations. Supporting custom time entry is a standard capability expected in any time tracking integration.
