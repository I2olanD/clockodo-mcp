---
title: "Clockodo MCP Server"
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
- [x] No technical implementation details included
- [x] A new team member could understand this PRD

---

## Product Overview

### Vision

Enable any AI assistant to start, manage, and stop Clockodo time tracking entries with zero friction — by interactively resolving the correct customer, project, and service through conversation.

### Problem Statement

Developers and knowledge workers using Clockodo for time tracking spend unnecessary context-switching time navigating the Clockodo web interface to find the right customer/project/service combination and type a description — breaking flow and causing tracking to be skipped or inaccurate. Starting a stopwatch requires at minimum 5–7 UI clicks plus manual text entry. This friction leads to under-tracked time and inaccurate billing.

### Value Proposition

By exposing Clockodo as an MCP server, any connected AI assistant (e.g., Claude) can start, stop, and manage time entries through natural conversation. The AI handles description generation, and users confirm the correct project/service interactively — reducing time-tracking friction to a single conversational turn.

---

## User Personas

### Primary Persona: Developer / Freelancer Using an AI Coding Assistant

- **Demographics:** Software developer or freelancer, 25–45, technically comfortable, uses Claude or similar AI assistant daily in their workflow (Claude Desktop, Cursor, Zed).
- **Goals:** Track time accurately without leaving the IDE or chat interface; avoid manual Clockodo UI for routine logging.
- **Pain Points:** Clockodo web UI requires multiple clicks and navigation; description writing interrupts focus; often forgets to start/stop timers; finding the right project from a long list is tedious.

### Secondary Personas

None in this phase.

---

## User Journey Maps

### Primary User Journey: Starting a Stopwatch via AI Chat

1. **Awareness:** Developer realizes they're starting work on a task and wants to track time.
2. **Consideration:** Instead of opening Clockodo web UI, they tell their AI assistant "start tracking time for the mobile app feature".
3. **Adoption:** AI calls MCP tools to list customers/projects, presents a short list, user confirms the correct one.
4. **Usage:**
   - User: "Track time for mobile app auth feature"
   - AI fetches customers → presents matching options → user picks "Acme Corp"
   - AI fetches projects for Acme Corp → presents matching options → user picks "Mobile App"
   - AI fetches services → user picks "Development" (Leistung)
   - AI generates a description → user approves or edits
   - AI starts the stopwatch → confirms with entry ID and start time
5. **Retention:** Timer is running; user works. When done, user says "stop timer" and AI stops it with one tool call.

### Secondary User Journeys

None in this phase.

---

## Feature Requirements

### Must Have Features

#### Feature 1: List Customers

- **User Story:** As a developer, I want to see my active Clockodo customers so that I can select the right one for time tracking.
- **Acceptance Criteria:**
  - [ ] Given the MCP server is configured with valid credentials, When the AI calls the list-customers tool, Then it returns a list of active customers with id and name
  - [ ] Given there are more than one page of customers, When the tool is called, Then all customers are returned (paginated fetching)
  - [ ] Given credentials are invalid, When the tool is called, Then an error is returned with a clear message

#### Feature 2: List Projects (filtered by customer)

- **User Story:** As a developer, I want to see projects belonging to a specific customer so that I can pick the right project.
- **Acceptance Criteria:**
  - [ ] Given a valid customers_id, When the AI calls the list-projects tool, Then only active projects for that customer are returned
  - [ ] Given no customers_id is provided, When the tool is called, Then all active projects across all customers are returned
  - [ ] Given a customer has no projects, When the tool is called, Then an empty list is returned with no error

#### Feature 3: List Services (Leistungen)

- **User Story:** As a developer, I want to see available services so that I can select the correct Leistung for my time entry.
- **Acceptance Criteria:**
  - [ ] Given valid credentials, When the AI calls the list-services tool, Then all active services are returned with id and name
  - [ ] Given there are no active services, When the tool is called, Then an empty list is returned with no error

#### Feature 4: Start Stopwatch

- **User Story:** As a developer, I want to start a Clockodo stopwatch for a specific customer, project, service, and description so that my time is accurately tracked.
- **Acceptance Criteria:**
  - [ ] Given valid customers_id and services_id, When the AI calls the start-clock tool, Then a new time entry is created and confirmed with its ID and start time
  - [ ] Given a projects_id is also provided, When the AI calls start-clock, Then the entry is linked to that project
  - [ ] Given a text description is provided, When the AI calls start-clock, Then the entry stores that description (max 1000 chars)
  - [ ] Given a clock is already running, When start-clock is called again, Then an error is returned indicating an active entry exists
  - [ ] Given invalid IDs are provided, When start-clock is called, Then a clear error is returned without creating a partial entry

#### Feature 5: Stop Stopwatch

- **User Story:** As a developer, I want to stop the currently running Clockodo stopwatch so that my time entry is finalized.
- **Acceptance Criteria:**
  - [ ] Given a clock is running, When the AI calls the stop-clock tool with the entry ID, Then the entry is stopped and the duration is returned
  - [ ] Given no clock is running, When stop-clock is called, Then a clear "no active entry" error is returned
  - [ ] Given a stop time is provided, When stop-clock is called, Then the entry end time is set to that value

#### Feature 6: Get Running Entry

- **User Story:** As a developer, I want to check if a stopwatch is currently running so that I don't accidentally create duplicate entries.
- **Acceptance Criteria:**
  - [ ] Given a clock is running, When the AI calls the get-running-entry tool, Then the current entry details (customer, project, service, start time, description) are returned
  - [ ] Given no clock is running, When the get-running-entry tool is called, Then the response indicates no active entry

### Should Have Features

- **Interactive guided flow prompt:** A single MCP prompt named "start-tracking" that orchestrates the full customer → project → service → description → start flow, reducing the number of AI reasoning steps required.
- **Fuzzy/search filtering:** The list-projects and list-customers tools accept an optional `query` parameter to filter results by name, reducing list size for easier AI selection.
- **Entry description suggestions:** The AI generates a description based on conversation context; the tool accepts it as-is without requiring user re-confirmation if the user previously approved.

### Could Have Features

- **List recent entries:** Show recent time entries to help detect duplicates or resume patterns.
- **Update running entry description:** Allow updating the text of a running entry mid-session.
- **List entry texts:** Fetch previously used descriptions (via /v2/entriesTexts) as suggestions.

### Won't Have (This Phase)

- Creating/updating/deleting customers, projects, or services (read-only for lookup entities)
- Managing absences, target hours, or lump sum entries
- Multi-user support (single authenticated user only)
- OAuth-based authentication (API key auth only for this phase)
- Reporting or analytics features
- Mobile or web UI — MCP protocol only

---

## Detailed Feature Specifications

### Feature: Start Stopwatch (Interactive Selection Flow)

**Description:** The core flow for starting a stopwatch. The AI orchestrates multiple tool calls to resolve the correct customer, project, and service, then starts the clock. This is the most complex feature and the primary user value.

**User Flow:**

1. User asks AI to "track time for [task description]"
2. AI calls `list-customers` to retrieve all active customers
3. AI presents the customer list and asks user to confirm
4. User selects a customer (by name or number)
5. AI calls `list-projects` filtered by the selected `customers_id`
6. AI presents the project list and asks user to confirm (or notes "no projects — using customer only")
7. AI calls `list-services` to retrieve all active services
8. AI presents the service list and asks user to select the Leistung
9. AI generates a description based on context (task mentioned, recent conversation)
10. AI presents the description and optionally asks user to approve or edit
11. AI calls `start-clock` with customers_id, projects_id (optional), services_id, and text
12. AI confirms: "Stopwatch started — [Customer] / [Project] / [Service] — [description]"

**Business Rules:**

- Rule 1: `customers_id` and `services_id` are always required to start the clock
- Rule 2: `projects_id` is optional; if customer has projects, AI should always try to resolve one
- Rule 3: Description (text) is optional in the API but the AI should always generate one
- Rule 4: Description must not exceed 1000 characters
- Rule 5: Only one clock can run at a time; starting a new one without stopping the existing one is an error
- Rule 6: Only active customers and projects should be shown in selection lists

**Edge Cases:**

- Customer has no projects → Start clock with customers_id and services_id only, no projects_id
- A clock is already running → Return current entry details and ask user if they want to stop it first
- User provides a description longer than 1000 characters → Truncate or ask AI to shorten before calling start-clock
- No active services found → Return error: "No active services configured in Clockodo"

---

## Success Metrics

### Key Performance Indicators

- **Adoption:** Developer uses MCP server to start ≥1 timer per working day within first week
- **Engagement:** ≥80% of timer start interactions complete successfully (clock actually starts) without requiring retry
- **Quality:** ≤5% of timer starts result in wrong project/service selection requiring correction
- **Business Impact:** Time entries created via MCP have descriptions ≥90% of the time (vs. manual entries which are often empty)

### Tracking Requirements

| Event | Properties | Purpose |
|-------|------------|---------|
| `clock_started` | customers_id, projects_id, services_id, has_description, text_length | Validate start flow success |
| `clock_stopped` | entry_id, duration_seconds | Validate stop flow |
| `list_customers_called` | result_count | Understand data volume |
| `list_projects_called` | customers_id, result_count | Understand data volume per customer |
| `start_clock_error` | error_type, missing_field | Identify common failure modes |

---

## Constraints and Assumptions

### Constraints

- Clockodo API rate limits: max 900 requests/minute per user — all tools must respect rate limits
- API authentication: email + API key via HTTP headers (no OAuth in this phase)
- API deprecation: v2/v3/v4 endpoints are being migrated — implementation must use current stable versions before May 2026 deprecation
- MCP transport: stdio only (Claude Desktop / local AI assistant use case)
- Single authenticated user per server instance (no multi-tenancy)

### Assumptions

- User has a valid Clockodo account with API access enabled
- User's Clockodo account has at least one customer, one project, and one service configured
- The AI assistant (client) presents tool results conversationally to the user — no custom UI is needed
- Credentials are provided via environment variables (CLOCKODO_EMAIL, CLOCKODO_API_KEY)
- The server runs locally on the developer's machine

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Clockodo API rate limiting during list operations | Medium | Low | Implement response caching for customers/projects/services (TTL ~5 minutes) |
| User selects wrong project due to similar names | Medium | Medium | Return customer name alongside project name in all list results |
| Clock already running when user tries to start | Medium | High | Always call get-running-entry before start-clock; warn user if one is active |
| API key exposed in logs | High | Low | Never log credentials; sanitize all error messages before returning to client |
| Clockodo API v2 deprecation (May 2026) | High | High | Track deprecation notices; update endpoints proactively |
| Description generated by AI is inappropriate or wrong | Low | Medium | AI presents description for user approval before starting clock |

---

## Open Questions

- [ ] Should the server support listing and resuming recent entries (e.g., "track same as yesterday")?
- [ ] Should the guided flow stop an already-running entry automatically or always ask?
- [ ] Is there a need to support `subprojects_id` (Clockodo supports sub-projects)?

---

## Supporting Research

### Competitive Analysis

Existing MCP time-tracking integrations (Toggl, Harvest) follow the same pattern: expose list tools for entities + a start/stop tool for timers. The Clockodo-specific distinction is the "Leistung" (service type) concept which is not present in Toggl — this requires a dedicated `list-services` tool step.

### User Research

Based on the user description: primary pain point is friction in the Clockodo web UI (multiple clicks, manual description writing). The core hypothesis is that a conversational interface reduces this to one natural-language request.

### Market Data

MCP adoption is accelerating in 2025–2026 among developer tools. Claude Desktop and Cursor both support MCP servers, making stdio-based MCP servers the most relevant deployment target for developer workflows.
