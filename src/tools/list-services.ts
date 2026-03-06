import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

export async function handleListServices(client: ClockodoClient) {
  try {
    const services = await client.listServices();
    return successResponse(services);
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerListServices(server: McpServer, client: ClockodoClient) {
  server.tool(
    "list_services",
    "List all active Clockodo services (Leistungen). Returns service IDs and names for selection.",
    {},
    () => handleListServices(client),
  );
}
