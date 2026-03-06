import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

export async function handleListCustomers(client: ClockodoClient) {
  try {
    const customers = await client.listCustomers();
    return successResponse(customers);
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerListCustomers(server: McpServer, client: ClockodoClient) {
  server.tool(
    "list_customers",
    "List all active Clockodo customers. Returns customer IDs and names for selection.",
    {},
    () => handleListCustomers(client),
  );
}
