#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerEventTools } from "./tools/events.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerMediaTools } from "./tools/media.js";
import { registerAutomationTools } from "./tools/automations.js";

const server = new McpServer({
  name: "peach",
  version: "0.2.0",
});

registerEventTools(server);
registerTemplateTools(server);
registerContactTools(server);
registerMessageTools(server);
registerMediaTools(server);
registerAutomationTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
