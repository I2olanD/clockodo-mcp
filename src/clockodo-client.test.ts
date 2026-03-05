import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClockodoApiError,
  ClockodoClient,
  type CreateEntryParams,
  type Customer,
  type Entry,
} from "./clockodo-client.js";

const EMAIL = "test@example.com";
const API_KEY = "secret-key";

function makePaginatedResponse<T>(dataKey: string, items: T[], currentPage = 1, countPages = 1) {
  return {
    ok: true,
    text: async () => "",
    json: async () => ({
      paging: {
        items_per_page: 50,
        current_page: currentPage,
        count_pages: countPages,
        count_items: items.length,
      },
      [dataKey]: items,
    }),
  } as Response;
}

function makeResponse(body: unknown, ok = true) {
  const bodyText = JSON.stringify(body);
  return {
    ok,
    status: ok ? 200 : ((body as { status: number }).status ?? 400),
    text: async () => bodyText,
    json: async () => body,
  } as unknown as Response;
}

function makeErrorResponse(status: number, bodyText: string) {
  return {
    ok: false,
    status,
    text: async () => bodyText,
    json: async () => {
      throw new Error("not json");
    },
  } as unknown as Response;
}

describe("ClockodoClient", () => {
  let mockFetch: ReturnType<typeof vi.fn<typeof fetch>>;
  let client: ClockodoClient;

  beforeEach(() => {
    mockFetch = vi.fn<typeof fetch>();
    global.fetch = mockFetch;
    client = new ClockodoClient(EMAIL, API_KEY);
  });

  describe("auth headers", () => {
    it("sends correct auth headers on every request", async () => {
      mockFetch.mockResolvedValueOnce(makePaginatedResponse("customers", []));

      await client.listCustomers();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toMatchObject({
        "X-ClockodoApiUser": EMAIL,
        "X-ClockodoApiKey": API_KEY,
        "X-Clockodo-External-Application": `clockodo-mcp;${EMAIL}`,
        "Content-Type": "application/json",
      });
    });
  });

  describe("listCustomers()", () => {
    it("fetches paginated results and aggregates them", async () => {
      const page1Items: Customer[] = [{ id: 1, name: "Acme", active: true }];
      const page2Items: Customer[] = [{ id: 2, name: "Beta", active: true }];

      mockFetch
        .mockResolvedValueOnce(makePaginatedResponse("customers", page1Items, 1, 2))
        .mockResolvedValueOnce(makePaginatedResponse("customers", page2Items, 2, 2));

      const result = await client.listCustomers();

      expect(result).toEqual([...page1Items, ...page2Items]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("sends filter[active]=true", async () => {
      mockFetch.mockResolvedValueOnce(makePaginatedResponse("customers", []));

      await client.listCustomers();

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("filter%5Bactive%5D=true");
    });

    it("returns cached data on second call", async () => {
      const items: Customer[] = [{ id: 1, name: "Acme", active: true }];
      mockFetch.mockResolvedValueOnce(makePaginatedResponse("customers", items));

      await client.listCustomers();
      const second = await client.listCustomers();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(second).toEqual(items);
    });
  });

  describe("listServices()", () => {
    it("returns services when API responds without paging object", async () => {
      const services = [{ id: 1, name: "Development", active: true }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => "",
        json: async () => ({ services }),
      } as Response);

      const result = await client.listServices();

      expect(result).toEqual(services);
    });
  });

  describe("listProjects()", () => {
    it("sends filter[customers_id] when customersId is provided", async () => {
      mockFetch.mockResolvedValueOnce(makePaginatedResponse("projects", []));

      await client.listProjects(42);

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("filter%5Bcustomers_id%5D=42");
    });

    it("returns all active projects when no customersId is provided", async () => {
      mockFetch.mockResolvedValueOnce(makePaginatedResponse("projects", []));

      await client.listProjects();

      const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).not.toContain("customers_id");
      expect(url).toContain("filter%5Bactive%5D=true");
    });
  });

  describe("getRunningEntry()", () => {
    it("returns entry when clock is running", async () => {
      const entry: Entry = {
        id: 99,
        customers_id: 1,
        projects_id: 2,
        services_id: 3,
        text: "working",
        time_since: "2024-01-01T09:00:00Z",
        time_until: null,
        duration: 0,
      };
      mockFetch.mockResolvedValueOnce(makeResponse({ running: entry }));

      const result = await client.getRunningEntry();

      expect(result).toEqual(entry);
    });

    it("returns null when no clock is running", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ running: null }));

      const result = await client.getRunningEntry();

      expect(result).toBeNull();
    });

    it("is never cached — always fetches", async () => {
      mockFetch
        .mockResolvedValueOnce(makeResponse({ running: null }))
        .mockResolvedValueOnce(makeResponse({ running: null }));

      await client.getRunningEntry();
      await client.getRunningEntry();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("startClock()", () => {
    it("sends POST with correct JSON body", async () => {
      const entry: Entry = {
        id: 10,
        customers_id: 1,
        projects_id: 5,
        services_id: 3,
        text: null,
        time_since: "2024-01-01T09:00:00Z",
        time_until: null,
        duration: 0,
      };
      mockFetch.mockResolvedValueOnce(makeResponse({ running: entry }));

      const result = await client.startClock({ customers_id: 1, services_id: 3, projects_id: 5 });

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/v2/clock");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toMatchObject({
        customers_id: 1,
        services_id: 3,
        projects_id: 5,
      });
      expect(result).toEqual(entry);
    });
  });

  describe("stopClock()", () => {
    it("sends DELETE to correct URL", async () => {
      const entry: Entry = {
        id: 10,
        customers_id: 1,
        projects_id: null,
        services_id: 3,
        text: null,
        time_since: "2024-01-01T09:00:00Z",
        time_until: "2024-01-01T10:00:00Z",
        duration: 3600,
      };
      mockFetch.mockResolvedValueOnce(makeResponse({ stopped: entry }));

      const result = await client.stopClock(10);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/v2/clock/10");
      expect(options.method).toBe("DELETE");
      expect(result).toEqual(entry);
    });
  });

  describe("createEntry()", () => {
    const params: CreateEntryParams = {
      customers_id: 1,
      services_id: 3,
      billable: 1,
      time_since: "2026-03-05T08:00:00.000Z",
      time_until: "2026-03-05T09:30:00.000Z",
      projects_id: 5,
      text: "Deep work session",
    };

    const createdEntry: Entry = {
      id: 42,
      customers_id: 1,
      projects_id: 5,
      services_id: 3,
      text: "Deep work session",
      time_since: "2026-03-05T08:00:00.000Z",
      time_until: "2026-03-05T09:30:00.000Z",
      duration: 5400,
      billable: 1,
    };

    it("sends POST to /v2/entries with correct JSON body", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: createdEntry }));

      await client.createEntry(params);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/v2/entries");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body as string)).toEqual(params);
    });

    it("sends correct auth headers", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: createdEntry }));

      await client.createEntry(params);

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toMatchObject({
        "X-ClockodoApiUser": EMAIL,
        "X-ClockodoApiKey": API_KEY,
      });
    });

    it("returns body.entry as Entry", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: createdEntry }));

      const result = await client.createEntry(params);

      expect(result).toEqual(createdEntry);
    });

    it("propagates ClockodoApiError on 4xx response", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse(422, "Unprocessable Entity"));

      await expect(client.createEntry(params)).rejects.toThrow(ClockodoApiError);
    });

    it("works with minimal required params (no projects_id or text)", async () => {
      const minimalParams: CreateEntryParams = {
        customers_id: 1,
        services_id: 3,
        billable: 1,
        time_since: "2026-03-05T08:00:00.000Z",
        time_until: "2026-03-05T08:00:00.000Z",
      };
      mockFetch.mockResolvedValueOnce(
        makeResponse({ entry: { ...createdEntry, projects_id: null, text: null, duration: 0 } }),
      );

      await client.createEntry(minimalParams);

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual(minimalParams);
    });
  });

  describe("updateEntry()", () => {
    const updatedEntry: Entry = {
      id: 42,
      customers_id: 1,
      projects_id: 5,
      services_id: 3,
      text: "Updated description",
      time_since: "2026-03-05T08:00:00.000Z",
      time_until: "2026-03-05T09:30:00.000Z",
      duration: 5400,
      billable: 0,
    };

    it("sends PUT to /v2/entries/{entryId} with correct JSON body", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: updatedEntry }));

      await client.updateEntry(42, { text: "Updated description", billable: 0 });

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/v2/entries/42");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body as string)).toEqual({
        text: "Updated description",
        billable: 0,
      });
    });

    it("sends correct auth headers", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: updatedEntry }));

      await client.updateEntry(42, { text: "Updated description" });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toMatchObject({
        "X-ClockodoApiUser": EMAIL,
        "X-ClockodoApiKey": API_KEY,
      });
    });

    it("returns body.entry as Entry", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: updatedEntry }));

      const result = await client.updateEntry(42, { text: "Updated description" });

      expect(result).toEqual(updatedEntry);
    });

    it("throws ClockodoApiError on 404 response", async () => {
      mockFetch.mockResolvedValueOnce(makeErrorResponse(404, "Not Found"));

      await expect(client.updateEntry(9999, { text: "x" })).rejects.toThrow(ClockodoApiError);
    });

    it("sends only the provided fields in the body", async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ entry: updatedEntry }));

      await client.updateEntry(42, { duration: 3600 });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual({ duration: 3600 });
    });
  });

  describe("error handling", () => {
    it("throws ClockodoApiError on 401 response", async () => {
      mockFetch
        .mockResolvedValueOnce(makeErrorResponse(401, "Unauthorized"))
        .mockResolvedValueOnce(makeErrorResponse(401, "Unauthorized"));

      await expect(client.listCustomers()).rejects.toThrow(ClockodoApiError);
      await expect(client.listCustomers()).rejects.toThrow("Clockodo API error: HTTP 401");
    });

    it("throws ClockodoApiError on 429 response", async () => {
      mockFetch
        .mockResolvedValueOnce(makeErrorResponse(429, "Too Many Requests"))
        .mockResolvedValueOnce(makeErrorResponse(429, "Too Many Requests"));

      const error = await client.listCustomers().catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ClockodoApiError);
      expect((error as ClockodoApiError).statusCode).toBe(429);
      expect((error as ClockodoApiError).body).toBe("Too Many Requests");
    });
  });
});
