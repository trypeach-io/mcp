import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

const ContactFields = {
  phone_number: z.string().describe("Phone number in E.164 format (e.g. +14155552671)"),
  name: z.string().optional().describe("Contact's full name"),
  email: z.string().email().optional().describe("Contact's email address"),
  timezone: z.string().optional().describe("Contact's timezone (e.g. America/New_York)"),
  metadata: z.record(z.unknown()).optional().describe("Custom metadata key-value pairs (merged with existing)"),
};

export function registerContactTools(server: McpServer): void {
  server.tool(
    "peach_create_contact",
    "Create or upsert a single contact in the Peach account",
    ContactFields,
    async (params) => {
      const result = await client.post("/api/v1/contacts", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_create_contacts",
    "Create or upsert multiple contacts in bulk in the Peach account",
    {
      contacts: z.array(z.object(ContactFields)).describe("Array of contacts to create or upsert"),
    },
    async ({ contacts }) => {
      const result = await client.post("/api/v1/contacts", contacts);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_update_contact",
    "Update an existing contact identified by their phone number",
    {
      phone_number: z.string().describe("Phone number of the contact to update in E.164 format (e.g. +14155552671)"),
      name: z.string().optional().describe("Updated full name"),
      email: z.string().email().optional().describe("Updated email address"),
      age: z.number().int().optional().describe("Updated age"),
      gender: z.string().optional().describe("Updated gender"),
      language: z.string().optional().describe("Updated language code (e.g. en)"),
      nickname: z.string().optional().describe("Updated nickname"),
      opted_out: z.boolean().optional().describe("Whether the contact has opted out of messaging"),
      timezone: z.string().optional().describe("Updated timezone (e.g. America/New_York)"),
      metadata: z.record(z.unknown()).optional().describe("Custom metadata to deep-merge with existing"),
    },
    async ({ phone_number, ...updates }) => {
      const result = await client.patch(
        `/api/v1/contacts/${encodeURIComponent(phone_number)}`,
        updates
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
