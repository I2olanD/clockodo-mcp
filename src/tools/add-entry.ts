import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

function toClockodoIsoString(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function handleAddEntry(
  client: ClockodoClient,
  args: {
    customers_id: number;
    services_id: number;
    duration_minutes: number;
    projects_id?: number;
    text?: string;
    billable?: boolean;
    start_time?: string;
  },
) {
  try {
    let timeSince: Date;
    let timeUntil: Date;

    if (args.start_time !== undefined) {
      timeSince = new Date(args.start_time);
      timeUntil = new Date(timeSince.getTime() + args.duration_minutes * 60 * 1000);
    } else {
      timeUntil = new Date();
      timeSince = new Date(timeUntil.getTime() - args.duration_minutes * 60 * 1000);
    }

    const entry = await client.createEntry({
      customers_id: args.customers_id,
      services_id: args.services_id,
      billable: args.billable === false ? 0 : 1,
      time_since: toClockodoIsoString(timeSince),
      time_until: toClockodoIsoString(timeUntil),
      projects_id: args.projects_id,
      text: args.text,
    });

    return successResponse(entry);
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerAddEntry(server: McpServer, client: ClockodoClient) {
  server.tool(
    "add_entry",
    "Add a completed time entry with duration in minutes. Optionally provide a start_time to anchor the entry at a specific time.",
    {
      customers_id: z.number().int().min(1).describe("Customer ID"),
      services_id: z.number().int().min(1).describe("Service ID"),
      duration_minutes: z.number().int().min(0).describe("Duration in minutes"),
      projects_id: z.number().int().min(1).optional().describe("Project ID"),
      text: z.string().max(1000).optional().describe("Entry description"),
      billable: z.boolean().optional().describe("Whether entry is billable (default: true)"),
      start_time: z
        .string()
        .datetime({ offset: true })
        .optional()
        .describe(
          "Entry start time as ISO 8601 (e.g. '2026-03-06T10:00:00Z' or '2026-03-06T10:00:00+01:00'). Defaults to now minus duration if omitted.",
        ),
    },
    (args) => handleAddEntry(client, args),
  );
}
