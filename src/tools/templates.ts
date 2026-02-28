import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

const ComponentAttributeSchema = z.object({
  component_type: z.enum(["header", "body", "footer", "buttons"]).describe("Component type"),
  sub_type: z.string().optional().describe("Button sub-type (e.g. quick_reply, url, phone_number)"),
  data_type: z.string().optional().describe("Data type for the component (e.g. text, image, video, document)"),
  name: z.string().optional().describe("Button label or component name"),
  value: z.string().optional().describe("Text content or button value/URL"),
  index: z.number().int().optional().describe("Position index of the component"),
  id: z.number().int().optional().describe("Component ID (required when updating existing components)"),
  _destroy: z.boolean().optional().describe("Set to true to remove this component during update"),
});

export function registerTemplateTools(server: McpServer): void {
  server.tool(
    "peach_list_templates",
    "List all WhatsApp templates in the Peach account",
    {
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async (params) => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.set("page", String(params.page));
      const qs = query.toString();
      const result = await client.get(`/api/v1/whats_app_templates${qs ? `?${qs}` : ""}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_get_template",
    "Get a specific WhatsApp template by its ID or template name",
    {
      id: z.string().describe("The template ID or template_name"),
    },
    async ({ id }) => {
      const result = await client.get(`/api/v1/whats_app_templates/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_create_template",
    "Create a new WhatsApp template in the Peach account. Must include at least a body component in components_attributes.",
    {
      template_name: z.string().describe("Unique name for the template (lowercase, underscores only, e.g. order_confirmation)"),
      language: z.string().describe("Language code for the template (e.g. en, en_US)"),
      category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).describe("Template category as required by WhatsApp"),
      components_attributes: z.array(ComponentAttributeSchema).describe(
        "Template components. Must include a body component. Each component has component_type, value, and optional sub_type/data_type/name/index."
      ),
      purpose: z.string().optional().describe("Purpose of the template (e.g. general)"),
      whats_app_business_account_id: z.string().optional().describe("External ID of the WhatsApp Business Account to use (defaults to the account's only WABA if there is one)"),
      folder: z.string().optional().describe("Folder to organise the template into"),
    },
    async ({ template_name, language, category, components_attributes, purpose, whats_app_business_account_id, folder }) => {
      const result = await client.post("/api/v1/whats_app_templates", {
        whats_app_template: {
          template_name,
          language,
          category,
          components_attributes,
          purpose,
          whats_app_business_account_id,
          folder,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_update_template",
    "Update an existing WhatsApp template's components or category",
    {
      id: z.string().describe("The template ID or template_name"),
      components_attributes: z.array(ComponentAttributeSchema).optional().describe(
        "Updated components. Include id on existing components to update them; set _destroy: true to remove one."
      ),
      category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).optional().describe("Updated template category"),
    },
    async ({ id, components_attributes, category }) => {
      const result = await client.patch(`/api/v1/whats_app_templates/${id}`, {
        whats_app_template: {
          components_attributes,
          category,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_archive_template",
    "Archive a WhatsApp template (must be approved, rejected, or draft status)",
    {
      id: z.string().describe("The template ID or template_name"),
    },
    async ({ id }) => {
      const result = await client.patch(`/api/v1/whats_app_templates/${id}/archive`, {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_pause_template",
    "Pause an approved WhatsApp template to temporarily stop it from being used",
    {
      id: z.string().describe("The template ID or template_name"),
    },
    async ({ id }) => {
      const result = await client.patch(`/api/v1/whats_app_templates/${id}/pause`, {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "peach_submit_template",
    "Submit a WhatsApp template for review and approval by Meta",
    {
      id: z.string().describe("The template ID or template_name"),
    },
    async ({ id }) => {
      const result = await client.patch(`/api/v1/whats_app_templates/${id}/submit`, {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
