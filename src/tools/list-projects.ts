import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClockodoClient } from "../clockodo-client.js";

export async function handleListProjects(client: ClockodoClient, args: { customers_id?: number }) {
  try {
    const projects = await client.listProjects(args.customers_id);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(projects, null, 2) }],
    };
  } catch (error) {
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

export function registerListProjects(server: McpServer, client: ClockodoClient) {
  server.tool(
    "list_projects",
    "List active Clockodo projects. Optionally filter by customer ID.",
    { customers_id: z.number().int().min(1).optional().describe("Filter by customer ID") },
    (args: { customers_id?: number }) => handleListProjects(client, args),
  );
}
