import { z } from "zod";
import { ClockodoClient, UpdateEntryParams } from "../clockodo-client.js";

export async function handleEditEntry(
  client: ClockodoClient,
  args: {
    entry_id: number;
    customers_id?: number;
    services_id?: number;
    projects_id?: number;
    duration_minutes?: number;
    text?: string;
    billable?: boolean;
  },
) {
  const params: UpdateEntryParams = {};

  if (args.customers_id !== undefined) params.customers_id = args.customers_id;
  if (args.services_id !== undefined) params.services_id = args.services_id;
  if (args.projects_id !== undefined) params.projects_id = args.projects_id;
  if (args.duration_minutes !== undefined) params.duration = args.duration_minutes * 60;
  if (args.text !== undefined) params.text = args.text;
  if (args.billable !== undefined) params.billable = args.billable ? 1 : 0;

  if (Object.keys(params).length === 0) {
    return {
      content: [{ type: "text" as const, text: "Error: At least one field must be provided to update." }],
      isError: true,
    };
  }

  try {
    const entry = await client.updateEntry(args.entry_id, params);
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

export function registerEditEntry(server: any, client: ClockodoClient) {
  server.tool(
    "edit_entry",
    "Edit an existing time entry.",
    {
      entry_id: z.number().int().min(1).describe("Entry ID to update"),
      customers_id: z.number().int().min(1).optional().describe("New customer ID"),
      services_id: z.number().int().min(1).optional().describe("New service ID"),
      projects_id: z.number().int().min(1).optional().describe("New project ID"),
      duration_minutes: z.number().int().min(0).optional().describe("New duration in minutes"),
      text: z.string().max(1000).optional().describe("New entry description"),
      billable: z.boolean().optional().describe("New billable status"),
    },
    (args: {
      entry_id: number;
      customers_id?: number;
      services_id?: number;
      projects_id?: number;
      duration_minutes?: number;
      text?: string;
      billable?: boolean;
    }) => handleEditEntry(client, args),
  );
}
