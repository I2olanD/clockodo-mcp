import { describe, expect, it, vi } from "vitest";
import type { ClockodoClient, Customer } from "../clockodo-client.js";
import { handleListCustomers } from "./list-customers.js";

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

describe("handleListCustomers()", () => {
  it("returns customers as formatted JSON text content", async () => {
    const customers: Customer[] = [
      { id: 1, name: "Acme Corp", active: true },
      { id: 2, name: "Beta Ltd", active: true },
    ];
    const client = makeClient({
      listCustomers: vi.fn().mockResolvedValue(customers),
    });

    const result = await handleListCustomers(client);

    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(customers, null, 2) }],
    });
  });

  it("returns isError true with error message when client throws", async () => {
    const client = makeClient({
      listCustomers: vi.fn().mockRejectedValue(new Error("API unavailable")),
    });

    const result = await handleListCustomers(client);

    expect(result).toEqual({
      content: [{ type: "text", text: "Error: API unavailable" }],
      isError: true,
    });
  });
});
