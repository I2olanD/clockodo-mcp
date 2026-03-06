import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClockodoClient } from "../clockodo-client.js";
import { errorResponse, successResponse } from "./tool-response.js";

export async function handleStopClock(client: ClockodoClient, args: { entry_id: number }) {
  try {
    const entry = await client.stopClock(args.entry_id);
    return successResponse(entry);
  } catch (error) {
    return errorResponse(error);
  }
}

export function registerStopClock(server: McpServer, client: ClockodoClient) {
  server.tool(
    "stop_clock",
    "Stop the currently running Clockodo stopwatch. Returns the stopped entry with final duration.",
    {
      entry_id: z.number().int().min(1).describe("ID of the running entry to stop"),
    },
    (args) => handleStopClock(client, args),
  );
}
