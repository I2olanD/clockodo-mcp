import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleListProjects } from "./list-projects.js";
import type { ClockodoClient, Project } from "../clockodo-client.js";

function makeClient(overrides: Partial<Record<keyof ClockodoClient, unknown>> = {}): ClockodoClient {
  return {
    listProjects: vi.fn(),
    ...overrides,
  } as unknown as ClockodoClient;
}

const PROJECT_A: Project = { id: 1, name: "Alpha", customers_id: 10, active: true };
const PROJECT_B: Project = { id: 2, name: "Beta", customers_id: 20, active: true };

describe("handleListProjects()", () => {
  let client: ClockodoClient;

  beforeEach(() => {
    client = makeClient();
  });

  it("returns all active projects when no filter is provided", async () => {
    vi.mocked(client.listProjects).mockResolvedValueOnce([PROJECT_A, PROJECT_B]);

    const result = await handleListProjects(client, {});

    expect(client.listProjects).toHaveBeenCalledWith(undefined);
    expect(result.content[0].text).toBe(JSON.stringify([PROJECT_A, PROJECT_B], null, 2));
    expect(result).not.toHaveProperty("isError");
  });

  it("passes customers_id to client when provided", async () => {
    vi.mocked(client.listProjects).mockResolvedValueOnce([PROJECT_A]);

    const result = await handleListProjects(client, { customers_id: 10 });

    expect(client.listProjects).toHaveBeenCalledWith(10);
    expect(result.content[0].text).toBe(JSON.stringify([PROJECT_A], null, 2));
    expect(result).not.toHaveProperty("isError");
  });

  it("returns empty array (not error) when customer has no projects", async () => {
    vi.mocked(client.listProjects).mockResolvedValueOnce([]);

    const result = await handleListProjects(client, { customers_id: 99 });

    expect(result.content[0].text).toBe("[]");
    expect(result).not.toHaveProperty("isError");
  });

  it("returns isError true when client throws", async () => {
    vi.mocked(client.listProjects).mockRejectedValueOnce(new Error("Clockodo API error 401: Unauthorized"));

    const result = await handleListProjects(client, {});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Error: Clockodo API error 401: Unauthorized");
  });
});
