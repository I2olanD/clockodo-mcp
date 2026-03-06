import { describe, expect, it, vi } from "vitest";
import type { Service } from "../clockodo-client.js";
import { handleListServices } from "./list-services.js";
import { makeClient } from "./test-helpers.js";

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
    expect(result).not.toHaveProperty("isError");
  });

  it("returns empty array JSON when no services exist", async () => {
    const client = makeClient({ listServices: vi.fn().mockResolvedValueOnce([]) });

    const result = await handleListServices(client);

    expect(result).toEqual({
      content: [{ type: "text", text: "[]" }],
    });
    expect(result).not.toHaveProperty("isError");
  });

  it("returns isError true with error message when client throws", async () => {
    const client = makeClient({
      listServices: vi.fn().mockRejectedValueOnce(new Error("Clockodo API error: HTTP 401")),
    });

    const result = await handleListServices(client);

    expect(result).toHaveProperty("isError", true);
    expect(result.content).toEqual([{ type: "text", text: "Error: Clockodo API error: HTTP 401" }]);
  });
});
