import { describe, expect, it, vi } from "vitest";
import type { Entry } from "../clockodo-client.js";
import { ClockodoApiError } from "../clockodo-client.js";
import { handleStartClock } from "./start-clock.js";
import { makeClient } from "./test-helpers.js";

const baseEntry: Entry = {
  id: 99,
  customers_id: 1,
  projects_id: null,
  services_id: 2,
  text: null,
  time_since: "2026-03-05T10:00:00Z",
  time_until: null,
  duration: 0,
};

describe("handleStartClock()", () => {
  it("creates entry with valid customers_id and services_id", async () => {
    const client = makeClient({
      startClock: vi.fn().mockResolvedValue(baseEntry),
    });

    const result = await handleStartClock(client, { customers_id: 1, services_id: 2 });

    expect(client.startClock).toHaveBeenCalledWith({ customers_id: 1, services_id: 2 });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(baseEntry, null, 2) }],
    });
  });

  it("includes projects_id when provided", async () => {
    const entryWithProject: Entry = { ...baseEntry, projects_id: 5 };
    const client = makeClient({
      startClock: vi.fn().mockResolvedValue(entryWithProject),
    });

    const result = await handleStartClock(client, {
      customers_id: 1,
      services_id: 2,
      projects_id: 5,
    });

    expect(client.startClock).toHaveBeenCalledWith({
      customers_id: 1,
      services_id: 2,
      projects_id: 5,
    });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(entryWithProject, null, 2) }],
    });
  });

  it("includes text description when provided", async () => {
    const entryWithText: Entry = { ...baseEntry, text: "Implementing feature X" };
    const client = makeClient({
      startClock: vi.fn().mockResolvedValue(entryWithText),
    });

    const result = await handleStartClock(client, {
      customers_id: 1,
      services_id: 2,
      text: "Implementing feature X",
    });

    expect(client.startClock).toHaveBeenCalledWith({
      customers_id: 1,
      services_id: 2,
      text: "Implementing feature X",
    });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(entryWithText, null, 2) }],
    });
  });

  it("returns specific message on 409 conflict error", async () => {
    const client = makeClient({
      startClock: vi.fn().mockRejectedValue(new ClockodoApiError(409, "Conflict")),
    });

    const result = await handleStartClock(client, { customers_id: 1, services_id: 2 });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "A clock is already running. Stop it first before starting a new one.",
        },
      ],
      isError: true,
    });
  });

  it("returns generic isError on other errors", async () => {
    const client = makeClient({
      startClock: vi.fn().mockRejectedValue(new Error("Network failure")),
    });

    const result = await handleStartClock(client, { customers_id: 1, services_id: 2 });

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: Network failure" }],
      isError: true,
    });
  });
});
