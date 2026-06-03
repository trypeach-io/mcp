import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { client } from "../client.js";

const DataMappingSchema = z.object({
  mapping_for: z
    .enum(["recipient", "variable"])
    .describe("recipient = who to message; variable = data usable as {{key}} in steps"),
  value: z
    .record(z.string())
    .describe('Map of field name => JSONPath, e.g. { "phone_number": "$.customer.phone" }'),
});

function toText(result: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
}

export function registerAutomationTools(server: McpServer): void {
  // ── Stream automations ──────────────────────────────────────────────────
  server.tool(
    "peach_list_automations",
    "List Stream automations (conversation flows) configured in Peach",
    {
      execution_mode: z
        .enum(["backend_driven", "definition_driven"])
        .optional()
        .describe("Filter by automation execution mode"),
    },
    async ({ execution_mode }) => {
      const qs = execution_mode ? `?execution_mode=${execution_mode}` : "";
      return toText(await client.get(`/api/v1/streams${qs}`));
    }
  );

  server.tool(
    "peach_get_automation",
    "Get a Stream automation by ID, including its step-graph definition",
    {
      id: z.string().describe("The Stream automation ID (strm_...)"),
    },
    async ({ id }) => toText(await client.get(`/api/v1/streams/${id}`))
  );

  server.tool(
    "peach_create_automation",
    "Create a definition-driven Stream automation with a step-graph JSON definition",
    {
      name: z.string().describe("Automation name"),
      definition: z
        .record(z.unknown())
        .describe(
          "Step-graph definition: { start_step, steps: { id: { type, payload, next_step } } }"
        ),
      description: z.string().optional().describe("Automation description"),
      status: z.enum(["draft", "published", "archived"]).optional().describe("Automation status"),
      business_phone_number: z
        .string()
        .optional()
        .describe("WA ID of the sending business phone number (e.g. 919876543210). Defaults to the account's first phone number."),
    },
    async (params) => toText(await client.post("/api/v1/streams", params))
  );

  server.tool(
    "peach_update_automation",
    "Update a Stream automation's definition, name, description, or status",
    {
      id: z.string().describe("The Stream automation ID (strm_...)"),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      definition: z.record(z.unknown()).optional().describe("Step-graph definition"),
    },
    async ({ id, ...rest }) => toText(await client.patch(`/api/v1/streams/${id}`, rest))
  );

  server.tool(
    "peach_trigger_automation",
    "Trigger a Stream automation for a contact (fires an event into the flow)",
    {
      id: z.string().describe("The Stream automation ID (strm_...)"),
      contact: z
        .object({
          phone_number: z.string().describe("Phone number in E.164 format"),
          name: z.string().optional(),
          email: z.string().email().optional(),
        })
        .describe("The contact to run the automation for. phone_number is required."),
      payload: z.record(z.unknown()).optional().describe("Optional event payload passed into the flow"),
    },
    async ({ id, contact, payload }) =>
      toText(await client.post(`/api/v1/streams/${id}/events`, { contact, ...(payload || {}) }))
  );

  // ── Trigger condition library ────────────────────────────────────────────
  server.tool(
    "peach_list_expressions",
    "List the trigger condition library (expressions). Each describes WHEN a trigger fires (e.g. \"Order Paid\") and the variables it needs. Reference one by id when creating a trigger.",
    {
      source: z
        .string()
        .optional()
        .describe('Filter by source/integration name (e.g. "peach_shopify", "stripe", "Peach")'),
    },
    async ({ source }) => {
      const qs = source ? `?source=${encodeURIComponent(source)}` : "";
      return toText(await client.get(`/api/v1/expressions${qs}`));
    }
  );

  // ── Triggers ───────────────────────────────────────────────────────────
  server.tool(
    "peach_list_triggers",
    "List the triggers configured on a Stream automation",
    {
      stream_id: z.string().describe("The Stream automation ID (strm_...)"),
    },
    async ({ stream_id }) => toText(await client.get(`/api/v1/streams/${stream_id}/triggers`))
  );

  server.tool(
    "peach_create_trigger",
    "Configure a trigger so a Stream automation runs when an event arrives. Choose a condition by its name (the WHEN, e.g. \"Order Paid\"), supply its variables, and map fields from the event payload into the stream context with JSONPath. The event source is derived automatically. Names come from peach_list_expressions.",
    {
      stream_id: z.string().describe("The Stream automation ID (strm_...) to run"),
      condition: z.string().describe('Condition name (the expression description, e.g. "Order Paid") from peach_list_expressions'),
      source: z
        .string()
        .optional()
        .describe('Optional. Narrows the condition to one source/integration when the same name exists for several (e.g. "peach_shopify")'),
      expression_id: z
        .string()
        .optional()
        .describe("Optional advanced alternative to `condition`: the exact expression ID (exp_...)"),
      variables: z
        .record(z.string())
        .optional()
        .describe('Values for the condition\'s variables, e.g. { "key_path": "$.source_name", "value": "pos" }'),
      data_mappings: z
        .array(DataMappingSchema)
        .optional()
        .describe("How to pull fields out of the event payload into the stream"),
      event_source_id: z
        .string()
        .optional()
        .describe("Only needed if the account has multiple sources for the expression's integration (esrc_...)"),
      activate: z
        .boolean()
        .optional()
        .describe("Activate immediately (registers webhooks). Defaults to false (draft)."),
      description: z.string().optional().describe("Optional human note describing the trigger"),
    },
    async ({ stream_id, ...rest }) =>
      toText(await client.post(`/api/v1/streams/${stream_id}/triggers`, rest))
  );

  server.tool(
    "peach_update_trigger",
    "Update a trigger's variables, data mappings, description, or activation state",
    {
      id: z.string().describe("The trigger ID (trig_...)"),
      variables: z.record(z.string()).optional().describe("New values for the expression's variables"),
      data_mappings: z
        .array(DataMappingSchema)
        .optional()
        .describe("Replaces all data mappings on the trigger"),
      description: z.string().optional(),
      activate: z.boolean().optional().describe("true activates (registers webhooks); false pauses"),
    },
    async ({ id, ...rest }) => toText(await client.patch(`/api/v1/triggers/${id}`, rest))
  );
}
