import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

export async function handleListProjects(client: ClockodoClient, args: { customers_id?: number }) {
  try {
    const projects = await client.listProjects(args.customers_id);
    return successResponse(projects);
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerListProjects(server: McpServer, client: ClockodoClient) {
  server.tool(
    "list_projects",
    "List active Clockodo projects. Optionally filter by customer ID.",
    { customers_id: z.number().int().min(1).optional().describe("Filter by customer ID") },
    (args) => handleListProjects(client, args),
  );
}
