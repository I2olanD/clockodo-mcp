import { z } from "zod";

const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
});

const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  customers_id: z.number(),
  active: z.boolean(),
});

const ServiceSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
});

const EntrySchema = z.object({
  id: z.number(),
  customers_id: z.number(),
  projects_id: z.number().nullable(),
  services_id: z.number(),
  text: z.string().nullable(),
  time_since: z.string(),
  time_until: z.string().nullable(),
  duration: z.number(),
  billable: z.number().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Entry = z.infer<typeof EntrySchema>;

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
    super(`Clockodo API error: HTTP ${statusCode}`);
    this.name = "ClockodoApiError";
  }
}

const PagingSchema = z.object({
  current_page: z.number(),
  count_pages: z.number(),
});

const RunningEntryResponse = z.object({ running: EntrySchema.nullable() });
const StoppedEntryResponse = z.object({ stopped: EntrySchema });
const EntryResponse = z.object({ entry: EntrySchema });

const BASE_URL = "https://my.clockodo.com/api";

export class ClockodoClient {
  private readonly headers: Record<string, string>;

  constructor(email: string, apiKey: string) {
    this.headers = {
      "X-ClockodoApiUser": email,
      "X-ClockodoApiKey": apiKey,
      "X-Clockodo-External-Application": `clockodo-mcp;${email}`,
      "Content-Type": "application/json",
    };
  }

  async listCustomers(): Promise<Customer[]> {
    return this.fetchAllPages<Customer>("/v2/customers", "customers", { "filter[active]": "true" });
  }

  async listProjects(customersId?: number): Promise<Project[]> {
    const params: Record<string, string> = { "filter[active]": "true" };
    if (customersId !== undefined) {
      params["filter[customers_id]"] = String(customersId);
    }
    return this.fetchAllPages<Project>("/v2/projects", "projects", params);
  }

  async listServices(): Promise<Service[]> {
    return this.fetchAllPages<Service>("/v2/services", "services");
  }

  async getRunningEntry(): Promise<Entry | null> {
    const response = await this.request("/v2/clock");
    const body = RunningEntryResponse.parse(await response.json());
    return body.running ?? null;
  }

  async startClock(params: StartClockParams): Promise<Entry> {
    const response = await this.request("/v2/clock", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const body = RunningEntryResponse.parse(await response.json());
    return body.running as Entry;
  }

  async stopClock(entryId: number): Promise<Entry> {
    const response = await this.request(`/v2/clock/${entryId}`, { method: "DELETE" });
    const body = StoppedEntryResponse.parse(await response.json());
    return body.stopped;
  }

  async createEntry(params: CreateEntryParams): Promise<Entry> {
    const response = await this.request("/v2/entries", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const body = EntryResponse.parse(await response.json());
    return body.entry;
  }

  async updateEntry(entryId: number, params: UpdateEntryParams): Promise<Entry> {
    const response = await this.request(`/v2/entries/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
    const body = EntryResponse.parse(await response.json());
    return body.entry;
  }

  private async fetchAllPages<T>(
    path: string,
    dataKey: string,
    params?: Record<string, string>,
  ): Promise<T[]> {
    const firstResponse = await this.request(path, {}, params);
    const firstBody = (await firstResponse.json()) as Record<string, unknown>;
    const pagingResult = PagingSchema.safeParse(firstBody.paging);

    if (!pagingResult.success) return (firstBody[dataKey] as T[]) ?? [];
    if (pagingResult.data.count_pages === 0) return [];

    const results: T[] = [...(firstBody[dataKey] as T[])];
    const totalPages = pagingResult.data.count_pages;

    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pageResults = await Promise.all(
        remainingPages.map(async (page) => {
          const response = await this.request(path, {}, { ...params, page: String(page) });
          const body = (await response.json()) as { [key: string]: unknown };
          return body[dataKey] as T[];
        }),
      );
      for (const items of pageResults) {
        results.push(...items);
      }
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
      process.stderr.write(`[clockodo-mcp] API error ${response.status}: ${body}\n`);
      throw new ClockodoApiError(response.status, body);
    }

    return response;
  }
}
