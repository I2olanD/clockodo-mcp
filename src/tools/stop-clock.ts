import { z } from "zod";
import { ClockodoClient } from "../clockodo-client.js";

export async function handleStopClock(client: ClockodoClient, args: { entry_id: number }) {
  try {
    const entry = await client.stopClock(args.entry_id);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(entry, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export function registerStopClock(server: any, client: ClockodoClient) {
  server.tool(
    "stop_clock",
    "Stop the currently running Clockodo stopwatch. Returns the stopped entry with final duration.",
    {
      entry_id: z.number().int().min(1).describe("ID of the running entry to stop"),
    },
    (args: { entry_id: number }) => handleStopClock(client, args),
  );
}
