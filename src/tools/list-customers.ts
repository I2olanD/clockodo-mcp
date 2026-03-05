import { ClockodoClient } from "../clockodo-client.js";

export async function handleListCustomers(client: ClockodoClient) {
  try {
    const customers = await client.listCustomers();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(customers, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export function registerListCustomers(server: any, client: ClockodoClient) {
  server.tool(
    "list_customers",
    "List all active Clockodo customers. Returns customer IDs and names for selection.",
    {},
    () => handleListCustomers(client),
  );
}
