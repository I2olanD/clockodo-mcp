import { z } from "zod";
import { ClockodoClient } from "../clockodo-client.js";

export async function handleAddEntry(
  client: ClockodoClient,
  args: {
    customers_id: number;
    services_id: number;
    duration_minutes: number;
    projects_id?: number;
    text?: string;
    billable?: boolean;
  },
) {
  try {
    const timeUntil = new Date();
    const timeSince = new Date(timeUntil.getTime() - args.duration_minutes * 60 * 1000);

    const entry = await client.createEntry({
      customers_id: args.customers_id,
      services_id: args.services_id,
      billable: args.billable === false ? 0 : 1,
      time_since: timeSince.toISOString(),
      time_until: timeUntil.toISOString(),
      projects_id: args.projects_id,
      text: args.text,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(entry, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export function registerAddEntry(server: any, client: ClockodoClient) {
  server.tool(
    "add_entry",
    "Add a completed time entry with duration in minutes.",
    {
      customers_id: z.number().int().min(1).describe("Customer ID"),
      services_id: z.number().int().min(1).describe("Service ID"),
      duration_minutes: z.number().int().min(0).describe("Duration in minutes"),
      projects_id: z.number().int().min(1).optional().describe("Project ID"),
      text: z.string().max(1000).optional().describe("Entry description"),
      billable: z.boolean().optional().describe("Whether entry is billable (default: true)"),
    },
    (args: {
      customers_id: number;
      services_id: number;
      duration_minutes: number;
      projects_id?: number;
      text?: string;
      billable?: boolean;
    }) => handleAddEntry(client, args),
  );
}
