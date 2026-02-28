import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

export function registerMessageTools(server: McpServer): void {
  server.tool(
    "peach_list_messages",
    "List messages in the Peach account with optional filters",
    {
      page: z.number().int().positive().optional().describe("Page number for pagination"),
      per_page: z.number().int().positive().optional().describe("Number of results per page"),
      phone_number: z
        .string()
        .optional()
        .describe("Filter by contact phone number in E.164 format"),
      direction: z
        .enum(["inbound", "outbound"])
        .optional()
        .describe("Filter by message direction"),
      from: z
        .string()
        .optional()
        .describe("ISO 8601 start datetime for filtering (e.g. 2024-01-01T00:00:00Z)"),
      to: z
        .string()
        .optional()
        .describe("ISO 8601 end datetime for filtering (e.g. 2024-01-31T23:59:59Z)"),
    },
    async (params) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.set(key, String(value));
        }
      }
      const qs = query.toString();
      const result = await client.get(`/api/v1/messages${qs ? `?${qs}` : ""}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
