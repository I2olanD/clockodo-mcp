import { describe, expect, it, vi } from "vitest";
import type { ClockodoClient, Entry } from "../clockodo-client.js";
import { handleStopClock } from "./stop-clock.js";

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

describe("handleStopClock()", () => {
  it("stops entry and returns details with duration", async () => {
    const stoppedEntry: Entry = {
      id: 42,
      customers_id: 1,
      projects_id: 5,
      services_id: 3,
      text: "Completed task",
      time_since: "2026-03-05T09:00:00Z",
      time_until: "2026-03-05T10:30:00Z",
      duration: 5400,
    };
    const client = makeClient({
      stopClock: vi.fn().mockResolvedValue(stoppedEntry),
    });

    const result = await handleStopClock(client, { entry_id: 42 });

    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(stoppedEntry, null, 2) }],
    });
  });

  it("passes entry_id correctly to client", async () => {
    const stoppedEntry: Entry = {
      id: 77,
      customers_id: 2,
      projects_id: null,
      services_id: 4,
      text: null,
      time_since: "2026-03-05T08:00:00Z",
      time_until: "2026-03-05T09:00:00Z",
      duration: 3600,
    };
    const client = makeClient({
      stopClock: vi.fn().mockResolvedValue(stoppedEntry),
    });

    await handleStopClock(client, { entry_id: 77 });

    expect(client.stopClock).toHaveBeenCalledWith(77);
  });

  it("returns isError true with error message when client throws", async () => {
    const client = makeClient({
      stopClock: vi.fn().mockRejectedValue(new Error("No running entry found")),
    });

    const result = await handleStopClock(client, { entry_id: 1 });

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: No running entry found" }],
      isError: true,
    });
  });
});
