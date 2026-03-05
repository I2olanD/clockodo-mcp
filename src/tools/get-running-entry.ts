import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClockodoClient } from "../clockodo-client.js";

export async function handleGetRunningEntry(client: ClockodoClient) {
  try {
    const entry = await client.getRunningEntry();
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ running: entry }, null, 2) }],
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

export function registerGetRunningEntry(server: McpServer, client: ClockodoClient) {
  server.tool(
    "get_running_entry",
    "Check if a Clockodo stopwatch is currently running. Returns the active entry details or null.",
    {},
    () => handleGetRunningEntry(client),
  );
}
