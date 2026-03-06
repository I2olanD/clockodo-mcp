import { vi } from "vitest";
import type { ClockodoClient } from "../clockodo-client.js";

export function makeClient(overrides: Partial<ClockodoClient> = {}): ClockodoClient {
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
