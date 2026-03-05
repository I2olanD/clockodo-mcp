import { TtlCache } from "./cache.js";

export interface Customer {
  id: number;
  name: string;
  active: boolean;
}

export interface Project {
  id: number;
  name: string;
  customers_id: number;
  active: boolean;
}

export interface Service {
  id: number;
  name: string;
  active: boolean;
}

export interface Entry {
  id: number;
  customers_id: number;
  projects_id: number | null;
  services_id: number;
  text: string | null;
  time_since: string;
  time_until: string | null;
  duration: number;
  billable?: number;
}

export interface CreateEntryParams {
  customers_id: number;
  services_id: number;
  billable: number;
  time_since: string;
  time_until: string;
  projects_id?: number;
  text?: string;
}

export interface UpdateEntryParams {
  customers_id?: number;
  services_id?: number;
  projects_id?: number;
  billable?: number;
  duration?: number;
  text?: string;
}

export interface StartClockParams {
  customers_id: number;
  services_id: number;
  projects_id?: number;
  text?: string;
}

export class ClockodoApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string,
  ) {
    super(`Clockodo API error ${statusCode}: ${body}`);
    this.name = "ClockodoApiError";
  }
}

interface PagingInfo {
  current_page: number;
  count_pages: number;
}

const BASE_URL = "https://my.clockodo.com/api";

export class ClockodoClient {
  private readonly headers: Record<string, string>;
  private readonly cache: TtlCache;

  constructor(email: string, apiKey: string, cache?: TtlCache) {
    this.headers = {
      "X-ClockodoApiUser": email,
      "X-ClockodoApiKey": apiKey,
      "X-Clockodo-External-Application": `clockodo-mcp;${email}`,
      "Content-Type": "application/json",
    };
    this.cache = cache ?? new TtlCache();
  }

  async listCustomers(): Promise<Customer[]> {
    const cacheKey = "customers";
    const cached = this.cache.get<Customer[]>(cacheKey);
    if (cached !== undefined) return cached;

    const result = await this.fetchAllPages<Customer>("/v2/customers", "customers", {
      "filter[active]": "true",
    });
    this.cache.set(cacheKey, result);
    return result;
  }

  async listProjects(customersId?: number): Promise<Project[]> {
    const cacheKey = `projects:${customersId ?? "all"}`;
    const cached = this.cache.get<Project[]>(cacheKey);
    if (cached !== undefined) return cached;

    const params: Record<string, string> = { "filter[active]": "true" };
    if (customersId !== undefined) {
      params["filter[customers_id]"] = String(customersId);
    }

    const result = await this.fetchAllPages<Project>("/v2/projects", "projects", params);
    this.cache.set(cacheKey, result);
    return result;
  }

  async listServices(): Promise<Service[]> {
    const cacheKey = "services";
    const cached = this.cache.get<Service[]>(cacheKey);
    if (cached !== undefined) return cached;

    const result = await this.fetchAllPages<Service>("/v2/services", "services");
    this.cache.set(cacheKey, result);
    return result;
  }

  async getRunningEntry(): Promise<Entry | null> {
    const response = await this.request("/v2/clock");
    const body = (await response.json()) as { running: Entry | null };
    return body.running ?? null;
  }

  async startClock(params: StartClockParams): Promise<Entry> {
    const response = await this.request("/v2/clock", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const body = (await response.json()) as { running: Entry };
    return body.running;
  }

  async stopClock(entryId: number): Promise<Entry> {
    const response = await this.request(`/v2/clock/${entryId}`, { method: "DELETE" });
    const body = (await response.json()) as { stopped: Entry };
    return body.stopped;
  }

  async createEntry(params: CreateEntryParams): Promise<Entry> {
    const response = await this.request("/v2/entries", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const body = (await response.json()) as { entry: Entry };
    return body.entry;
  }

  async updateEntry(entryId: number, params: UpdateEntryParams): Promise<Entry> {
    const response = await this.request(`/v2/entries/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
    const body = (await response.json()) as { entry: Entry };
    return body.entry;
  }

  private async fetchAllPages<T>(
    path: string,
    dataKey: string,
    params?: Record<string, string>,
  ): Promise<T[]> {
    const firstResponse = await this.request(path, {}, params);
    const firstBody = (await firstResponse.json()) as { paging: PagingInfo; [key: string]: unknown };

    if (!firstBody.paging) return (firstBody[dataKey] as T[]) ?? [];
    if (firstBody.paging.count_pages === 0) return [];

    const results: T[] = [...(firstBody[dataKey] as T[])];
    let currentPage = firstBody.paging.current_page;
    const totalPages = firstBody.paging.count_pages;

    while (currentPage < totalPages) {
      currentPage += 1;
      const response = await this.request(path, {}, { ...params, page: String(currentPage) });
      const body = (await response.json()) as { paging: PagingInfo; [key: string]: unknown };
      results.push(...(body[dataKey] as T[]));
    }

    return results;
  }

  private async request(
    path: string,
    init: RequestInit = {},
    params?: Record<string, string>,
  ): Promise<Response> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      ...init,
      headers: { ...this.headers, ...(init.headers as Record<string, string> | undefined) },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ClockodoApiError(response.status, body);
    }

    return response;
  }
}
