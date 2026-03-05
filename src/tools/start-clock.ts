import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockodoApiError, type ClockodoClient } from "../clockodo-client.js";

export async function handleStartClock(
  client: ClockodoClient,
  args: { customers_id: number; services_id: number; projects_id?: number; text?: string },
) {
  try {
    const entry = await client.startClock(args);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(entry, null, 2) }],
    };
  } catch (error) {
    if (error instanceof ClockodoApiError && error.statusCode === 409) {
      return {
        content: [
          {
            type: "text" as const,
            text: "A clock is already running. Stop it first before starting a new one.",
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export function registerStartClock(server: McpServer, client: ClockodoClient) {
  server.tool(
    "start_clock",
    "Start a Clockodo stopwatch for a specific customer, service, and optionally a project with a description.",
    {
      customers_id: z.number().int().min(1).describe("Customer ID"),
      services_id: z.number().int().min(1).describe("Service ID"),
      projects_id: z.number().int().min(1).optional().describe("Project ID"),
      text: z.string().max(1000).optional().describe("Entry description"),
    },
    (args: { customers_id: number; services_id: number; projects_id?: number; text?: string }) =>
      handleStartClock(client, args),
  );
}
