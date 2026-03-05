import { describe, expect, it, vi } from "vitest";
import type { ClockodoClient, Service } from "../clockodo-client.js";
import { handleListServices } from "./list-services.js";

function makeClient(
  overrides: Partial<Record<keyof ClockodoClient, unknown>> = {},
): ClockodoClient {
  return {
    listServices: vi.fn(),
    ...overrides,
  } as unknown as ClockodoClient;
}

describe("handleListServices()", () => {
  it("returns all services as JSON text content", async () => {
    const services: Service[] = [
      { id: 1, name: "Development", active: true },
      { id: 2, name: "Consulting", active: true },
    ];
    const client = makeClient({ listServices: vi.fn().mockResolvedValueOnce(services) });

    const result = await handleListServices(client);

    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
    });
    expect(result.isError).toBeUndefined();
  });

  it("returns empty array JSON when no services exist", async () => {
    const client = makeClient({ listServices: vi.fn().mockResolvedValueOnce([]) });

    const result = await handleListServices(client);

    expect(result).toEqual({
      content: [{ type: "text", text: "[]" }],
    });
    expect(result.isError).toBeUndefined();
  });

  it("returns isError true with error message when client throws", async () => {
    const client = makeClient({
      listServices: vi
        .fn()
        .mockRejectedValueOnce(new Error("Clockodo API error 401: Unauthorized")),
    });

    const result = await handleListServices(client);

    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      { type: "text", text: "Error: Clockodo API error 401: Unauthorized" },
    ]);
  });
});
