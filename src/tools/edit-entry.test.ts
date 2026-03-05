import { describe, expect, it, vi } from "vitest";
import type { ClockodoClient, Entry } from "../clockodo-client.js";
import { handleEditEntry } from "./edit-entry.js";

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

describe("handleEditEntry()", () => {
  it("updates entry duration (converts minutes to seconds) and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, duration: 5400 };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    const result = await handleEditEntry(client, {
      entry_id: 42,
      duration_minutes: 90,
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { duration: 5400 });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(updatedEntry, null, 2) }],
    });
  });

  it("updates text field and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, text: "New description" };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    const result = await handleEditEntry(client, {
      entry_id: 42,
      text: "New description",
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { text: "New description" });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(updatedEntry, null, 2) }],
    });
  });

  it("updates customers_id and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, customers_id: 7 };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    const result = await handleEditEntry(client, {
      entry_id: 42,
      customers_id: 7,
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { customers_id: 7 });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(updatedEntry, null, 2) }],
    });
  });

  it("updates projects_id and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, projects_id: 9 };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    const result = await handleEditEntry(client, {
      entry_id: 42,
      projects_id: 9,
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { projects_id: 9 });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(updatedEntry, null, 2) }],
    });
  });

  it("maps billable=true to 1 and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, billable: 1 };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    await handleEditEntry(client, {
      entry_id: 42,
      billable: true,
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { billable: 1 });
  });

  it("maps billable=false to 0 and returns JSON", async () => {
    const updatedEntry: Entry = { ...baseEntry, billable: 0 };
    const client = makeClient({
      updateEntry: vi.fn().mockResolvedValue(updatedEntry),
    });

    await handleEditEntry(client, {
      entry_id: 42,
      billable: false,
    });

    expect(client.updateEntry).toHaveBeenCalledWith(42, { billable: 0 });
  });

  it("returns error when no fields provided besides entry_id", async () => {
    const client = makeClient();

    const result = await handleEditEntry(client, { entry_id: 42 });

    expect(client.updateEntry).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ type: "text", text: "Error: At least one field must be provided to update." }],
      isError: true,
    });
  });

  it("returns isError true with error message when API returns 404", async () => {
    const client = makeClient({
      updateEntry: vi.fn().mockRejectedValue(new Error("Clockodo API error 404: Not Found")),
    });

    const result = await handleEditEntry(client, {
      entry_id: 99999,
      text: "Updated",
    });

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: Clockodo API error 404: Not Found" }],
      isError: true,
    });
  });
});
