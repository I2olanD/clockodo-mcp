import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ClockodoClient } from "./clockodo-client.js";
import { registerListCustomers } from "./tools/list-customers.js";
import { registerListProjects } from "./tools/list-projects.js";
import { registerListServices } from "./tools/list-services.js";
import { registerStartClock } from "./tools/start-clock.js";
import { registerStopClock } from "./tools/stop-clock.js";
import { registerGetRunningEntry } from "./tools/get-running-entry.js";
import { registerAddEntry } from "./tools/add-entry.js";
import { registerEditEntry } from "./tools/edit-entry.js";

const email = process.env.CLOCKODO_EMAIL;
const apiKey = process.env.CLOCKODO_API_KEY;

if (!email || !apiKey) {
  console.error("Missing required environment variables: CLOCKODO_EMAIL and CLOCKODO_API_KEY");
  process.exit(1);
}

const server = new McpServer({
  name: "clockodo-mcp",
  version: "0.1.0",
});

const client = new ClockodoClient(email, apiKey);

registerListCustomers(server, client);
registerListProjects(server, client);
registerListServices(server, client);
registerStartClock(server, client);
registerStopClock(server, client);
registerGetRunningEntry(server, client);
registerAddEntry(server, client);
registerEditEntry(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
