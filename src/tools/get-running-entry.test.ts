import { describe, expect, it, vi } from "vitest";
import type { ClockodoClient, Entry } from "../clockodo-client.js";
import { handleGetRunningEntry } from "./get-running-entry.js";

function makeClient(overrides: Partial<ClockodoClient> = {}): ClockodoClient {
  return {
    listCustomers: vi.fn(),
    listProjects: vi.fn(),
    listServices: vi.fn(),
    getRunningEntry: vi.fn(),
    startClock: vi.fn(),
    stopClock: vi.fn(),
    ...overrides,
  } as unknown as ClockodoClient;
}

describe("handleGetRunningEntry()", () => {
  it("returns entry details when clock is running", async () => {
    const entry: Entry = {
      id: 42,
      customers_id: 1,
      projects_id: 5,
      services_id: 3,
      text: "Working on feature",
      time_since: "2026-03-05T09:00:00Z",
      time_until: null,
      duration: 0,
    };
    const client = makeClient({
      getRunningEntry: vi.fn().mockResolvedValue(entry),
    });

    const result = await handleGetRunningEntry(client);

    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify({ running: entry }, null, 2) }],
    });
  });

  it("returns running null when no clock is running", async () => {
    const client = makeClient({
      getRunningEntry: vi.fn().mockResolvedValue(null),
    });

    const result = await handleGetRunningEntry(client);

    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify({ running: null }, null, 2) }],
    });
  });

  it("returns isError true with error message when client throws", async () => {
    const client = makeClient({
      getRunningEntry: vi.fn().mockRejectedValue(new Error("API unavailable")),
    });

    const result = await handleGetRunningEntry(client);

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: API unavailable" }],
      isError: true,
    });
  });
});
