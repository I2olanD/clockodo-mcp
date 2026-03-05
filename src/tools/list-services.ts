import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClockodoClient } from "../clockodo-client.js";

export async function handleListServices(client: ClockodoClient) {
  try {
    const services = await client.listServices();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(services, null, 2) }],
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

export function registerListServices(server: McpServer, client: ClockodoClient) {
  server.tool(
    "list_services",
    "List all active Clockodo services (Leistungen). Returns service IDs and names for selection.",
    {},
    () => handleListServices(client),
  );
}
