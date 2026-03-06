import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

export async function handleGetRunningEntry(client: ClockodoClient) {
  try {
    const entry = await client.getRunningEntry();
    return successResponse({ running: entry });
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerGetRunningEntry(server: McpServer, client: ClockodoClient) {
  server.tool(
    "get_running_entry",
    "Check if a Clockodo stopwatch is currently running. Returns the active entry details or null.",
    {},
    () => handleGetRunningEntry(client),
  );
}
