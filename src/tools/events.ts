import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

const ContactSchema = z.object({
  phone_number: z.string().describe("Phone number in E.164 format (e.g. +14155552671)"),
  name: z.string().optional().describe("Contact's full name"),
  email: z.string().email().optional().describe("Contact's email address"),
  metadata: z.record(z.unknown()).optional().describe("Custom metadata key-value pairs"),
});

export function registerEventTools(server: McpServer): void {
  server.tool(
    "peach_send_template_message",
    "Send a WhatsApp template message to a contact via the Peach API",
    {
      contact: ContactSchema.describe("The recipient contact. phone_number is required."),
      template_message: z.object({
        whats_app_template_id: z.string().describe("ID of the WhatsApp template to use"),
        liquid_values: z.record(z.unknown()).optional().describe("Variable values for template placeholders"),
        business_phone_number: z.string().optional().describe("WA ID of the sending phone number to use"),
      }).describe("Template message parameters"),
    },
    async ({ contact, template_message }) => {
      const result = await client.post("/api/v1/events?sync=true", {
        event_type: "send_template_message",
        contact,
        template_message,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_launch_broadcast",
    "Create and launch a broadcast campaign to multiple contacts via the Peach API",
    {
      broadcast: z.object({
        whats_app_template_id: z.string().describe("ID of the WhatsApp template to use"),
        name: z.string().describe("Name of the broadcast campaign"),
        contacts: z.array(z.object({
          phone_number: z.string().describe("Phone number in E.164 format"),
          name: z.string().optional().describe("Contact name"),
          liquid_values: z.record(z.unknown()).optional().describe("Per-contact template variable values"),
        })).optional().describe("Explicit list of contacts to send to"),
        audience_id: z.string().optional().describe("ID of an existing audience/list to send to"),
        phone_number: z.string().optional().describe("WA ID of the sending phone number to use"),
        delivery_mode: z.enum(["instant", "smart"]).optional().describe("Delivery mode: instant (asap) or smart (gradual)"),
        scheduled_launch_time: z.string().optional().describe("ISO 8601 datetime to schedule the send (e.g. 2024-01-15T10:00:00Z)"),
        liquid_values: z.record(z.unknown()).optional().describe("Global template variable values for all contacts"),
      }).describe("Broadcast parameters"),
    },
    async ({ broadcast }) => {
      const result = await client.post("/api/v1/events?sync=true", {
        event_type: "send_broadcast",
        broadcast,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_connect_to_ai_agent",
    "Send a template message to a contact and connect them to an AI agent for automated follow-up",
    {
      contact: ContactSchema.describe("The recipient contact. phone_number is required."),
      template_message: z.object({
        whats_app_template_id: z.string().describe("ID of the WhatsApp template to send"),
        liquid_values: z.record(z.unknown()).optional().describe("Variable values for template placeholders"),
        business_phone_number: z.string().optional().describe("WA ID of the sending phone number to use"),
      }).describe("Template message parameters"),
      ai_agent: z.object({
        id: z.string().describe("ID of the AI agent to connect the contact to"),
      }).optional().describe("AI agent to connect the contact to after the template message"),
    },
    async ({ contact, template_message, ai_agent }) => {
      const result = await client.post("/api/v1/events?sync=true", {
        event_type: "connect_to_ai_agent",
        contact,
        template_message,
        ai_agent,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_send_app_message",
    "Trigger a flow or app-initiated message to a contact via the Peach API",
    {
      contact: ContactSchema.describe("The recipient contact. phone_number is required."),
      flow: z.object({
        id: z.string().describe("ID of the flow to execute"),
        liquid_values: z.record(z.unknown()).optional().describe("Variable values for the flow"),
        whats_app_template_id: z.string().optional().describe("Fallback template ID if the reply window is closed"),
      }).describe("Flow parameters"),
    },
    async ({ contact, flow }) => {
      const result = await client.post("/api/v1/events?sync=true", {
        event_type: "send_app_message",
        contact,
        flow,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_get_event_status",
    "Get the status and details of a specific event by its ID",
    {
      event_id: z.string().describe("The ID of the event to retrieve"),
    },
    async ({ event_id }) => {
      const result = await client.get(`/api/v1/events/${event_id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_list_template_messages",
    "List template messages sent via the Peach API with optional filters",
    {
      page: z.number().int().positive().optional().describe("Page number for pagination"),
      per_page: z.number().int().positive().optional().describe("Number of results per page"),
      status: z.string().optional().describe("Filter by message status (e.g. delivered, read, failed)"),
      phone_number: z.string().optional().describe("Filter by recipient phone number in E.164 format"),
      template_name: z.string().optional().describe("Filter by template name"),
      from: z.string().optional().describe("ISO 8601 start datetime for filtering (e.g. 2024-01-01T00:00:00Z)"),
      to: z.string().optional().describe("ISO 8601 end datetime for filtering (e.g. 2024-01-31T23:59:59Z)"),
    },
    async (params) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) query.set(key, String(value));
      }
      const qs = query.toString();
      const result = await client.get(`/api/v1/template_messages${qs ? `?${qs}` : ""}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
