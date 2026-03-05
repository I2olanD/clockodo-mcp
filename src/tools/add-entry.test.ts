import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleAddEntry } from "./add-entry.js";
import type { ClockodoClient, Entry } from "../clockodo-client.js";

function makeClient(overrides: Partial<ClockodoClient> = {}): ClockodoClient {
  return {
    listCustomers: vi.fn(),
    listProjects: vi.fn(),
    listServices: vi.fn(),
    getRunningEntry: vi.fn(),
    startClock: vi.fn(),
    stopClock: vi.fn(),
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    ...overrides,
  } as unknown as ClockodoClient;
}

const baseEntry: Entry = {
  id: 42,
  customers_id: 1,
  projects_id: null,
  services_id: 2,
  text: null,
  time_since: "2026-03-05T09:00:00.000Z",
  time_until: "2026-03-05T10:00:00.000Z",
  duration: 3600,
  billable: 1,
};

describe("handleAddEntry()", () => {
  let fixedNow: Date;

  beforeEach(() => {
    fixedNow = new Date("2026-03-05T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates entry with correct time window and returns JSON", async () => {
    const client = makeClient({
      createEntry: vi.fn().mockResolvedValue(baseEntry),
    });

    const result = await handleAddEntry(client, {
      customers_id: 1,
      services_id: 2,
      duration_minutes: 60,
    });

    expect(client.createEntry).toHaveBeenCalledWith({
      customers_id: 1,
      services_id: 2,
      billable: 1,
      time_since: "2026-03-05T09:00:00Z",
      time_until: "2026-03-05T10:00:00Z",
    });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(baseEntry, null, 2) }],
    });
  });

  it("defaults billable to 1 when billable is not provided", async () => {
    const client = makeClient({
      createEntry: vi.fn().mockResolvedValue(baseEntry),
    });

    await handleAddEntry(client, {
      customers_id: 1,
      services_id: 2,
      duration_minutes: 30,
    });

    expect(client.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ billable: 1 }),
    );
  });

  it("maps billable=false to 0", async () => {
    const notBillableEntry: Entry = { ...baseEntry, billable: 0 };
    const client = makeClient({
      createEntry: vi.fn().mockResolvedValue(notBillableEntry),
    });

    await handleAddEntry(client, {
      customers_id: 1,
      services_id: 2,
      duration_minutes: 30,
      billable: false,
    });

    expect(client.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ billable: 0 }),
    );
  });

  it("forwards optional projects_id and text", async () => {
    const entryWithOptionals: Entry = { ...baseEntry, projects_id: 7, text: "Sprint planning" };
    const client = makeClient({
      createEntry: vi.fn().mockResolvedValue(entryWithOptionals),
    });

    const result = await handleAddEntry(client, {
      customers_id: 1,
      services_id: 2,
      duration_minutes: 45,
      projects_id: 7,
      text: "Sprint planning",
    });

    expect(client.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ projects_id: 7, text: "Sprint planning" }),
    );
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(entryWithOptionals, null, 2) }],
    });
  });

  it("returns isError with error message on API failure", async () => {
    const client = makeClient({
      createEntry: vi.fn().mockRejectedValue(new Error("Network failure")),
    });

    const result = await handleAddEntry(client, {
      customers_id: 1,
      services_id: 2,
      duration_minutes: 30,
    });

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: Network failure" }],
      isError: true,
    });
  });

  describe("with start_time", () => {
    it("uses start_time as time_since and calculates time_until", async () => {
      const client = makeClient({
        createEntry: vi.fn().mockResolvedValue(baseEntry),
      });

      await handleAddEntry(client, {
        customers_id: 1,
        services_id: 2,
        duration_minutes: 30,
        start_time: "2026-03-06T10:00:00Z",
      });

      expect(client.createEntry).toHaveBeenCalledWith({
        customers_id: 1,
        services_id: 2,
        billable: 1,
        time_since: "2026-03-06T10:00:00Z",
        time_until: "2026-03-06T10:30:00Z",
      });
    });

    it("normalizes timezone offset to UTC", async () => {
      const client = makeClient({
        createEntry: vi.fn().mockResolvedValue(baseEntry),
      });

      await handleAddEntry(client, {
        customers_id: 1,
        services_id: 2,
        duration_minutes: 30,
        start_time: "2026-03-06T10:00:00+01:00",
      });

      expect(client.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          time_since: "2026-03-06T09:00:00Z",
          time_until: "2026-03-06T09:30:00Z",
        }),
      );
    });

    it("handles midnight crossover", async () => {
      const client = makeClient({
        createEntry: vi.fn().mockResolvedValue(baseEntry),
      });

      await handleAddEntry(client, {
        customers_id: 1,
        services_id: 2,
        duration_minutes: 30,
        start_time: "2026-03-05T23:45:00Z",
      });

      expect(client.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          time_since: "2026-03-05T23:45:00Z",
          time_until: "2026-03-06T00:15:00Z",
        }),
      );
    });

    it("handles zero duration with custom start_time", async () => {
      const client = makeClient({
        createEntry: vi.fn().mockResolvedValue(baseEntry),
      });

      await handleAddEntry(client, {
        customers_id: 1,
        services_id: 2,
        duration_minutes: 0,
        start_time: "2026-03-06T10:00:00Z",
      });

      expect(client.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          time_since: "2026-03-06T10:00:00Z",
          time_until: "2026-03-06T10:00:00Z",
        }),
      );
    });
  });
});
