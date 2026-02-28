import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

export function registerMediaTools(server: McpServer): void {
  server.tool(
    "peach_list_media",
    "List media files uploaded to the Peach account",
    {
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async (params) => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      const qs = query.toString();
      const result = await client.get(`/api/v1/medias${qs ? `?${qs}` : ""}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_upload_media",
    "Upload a media file to Peach using base64-encoded file content",
    {
      data: z.string().describe("Base64-encoded file content"),
      filename: z.string().describe("Filename including extension (e.g. photo.jpg)"),
      content_type: z.string().optional().describe("MIME type of the file (e.g. image/jpeg, video/mp4)"),
    },
    async ({ data, filename, content_type }) => {
      const result = await client.post("/api/v1/medias", {
        media: { data, filename, content_type },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_delete_media",
    "Delete a media file from the Peach account by its ID",
    {
      media_id: z.string().describe("The ID of the media file to delete"),
    },
    async ({ media_id }) => {
      const result = await client.delete(`/api/v1/medias/${media_id}`);
      return {
        content: [
          {
            type: "text",
            text: result !== undefined ? JSON.stringify(result, null, 2) : "Media deleted successfully",
          },
        ],
      };
    }
  );
}
