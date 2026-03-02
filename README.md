# @peachai/mcp

MCP (Model Context Protocol) server for the [Peach](https://trypeach.ai) WhatsApp messaging platform. Lets AI assistants like Claude send messages, manage templates, contacts, and media directly through your Peach account.

## Requirements

- Node.js 18 or higher
- A Peach account with an API key

## Getting your API key

Log in to [app.trypeach.ai](https://app.trypeach.ai), go to **Settings → API**, and copy your API key.

## Setup

### Hosted Server

*Recommended*
Peach offers hosted MCP server. We recommend using this.
```json
{
  "mcpServers": {
    "peach": {
      "command": "/Users/suresh/.nvm/versions/node/v20.19.5/bin/node",
      "args": [
        "/Users/suresh/.nvm/versions/node/v20.19.5/lib/node_modules/mcp-remote/dist/proxy.js",
        "https://app.trypeach.ai/api/mcp",
        "--header",
        "Authorization: <YOUR PEACH API KEY>"
      ]
    }
  }
}
```

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "peach": {
      "command": "npx",
      "args": ["-y", "@peachai/mcp"],
      "env": {
        "PEACH_API_KEY": "your-api-key"
      }
    }
  }
}
```

Restart Claude Desktop. You should see the Peach tools available in your conversation.

### Cursor

Go to **Settings → MCP** and add:

```json
{
  "peach": {
    "command": "npx",
    "args": ["-y", "@peachai/mcp"],
    "env": {
      "PEACH_API_KEY": "your-api-key"
    }
  }
}
```

### Claude Code

Run this command to add Peach AI to your Claude Code setup:

```bash
claude mcp add --scope user --env PEACH_API_KEY=your-api-key peach -- npx -y @peachai/mcp
```

Or add it manually to your `.mcp.json`:

```json
{
  "mcpServers": {
    "peach": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@peachai/mcp"],
      "env": {
        "PEACH_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available tools

### Messaging
| Tool | Description |
|------|-------------|
| `peach_send_template_message` | Send a WhatsApp template message to a contact |
| `peach_send_app_message` | Trigger a flow or app-initiated message |
| `peach_connect_to_ai_agent` | Send a template and connect the contact to an AI agent |
| `peach_get_event_status` | Check the status of a sent event |
| `peach_list_template_messages` | List sent template messages with filters |

### Broadcasts
| Tool | Description |
|------|-------------|
| `peach_launch_broadcast` | Create and launch a broadcast campaign |

### Templates
| Tool | Description |
|------|-------------|
| `peach_list_templates` | List all WhatsApp templates |
| `peach_get_template` | Get a specific template by ID or name |
| `peach_create_template` | Create a new WhatsApp template |
| `peach_update_template` | Update an existing template |
| `peach_submit_template` | Submit a template for Meta review |
| `peach_pause_template` | Pause an approved template |
| `peach_archive_template` | Archive a template |

### Contacts
| Tool | Description |
|------|-------------|
| `peach_create_contact` | Create or upsert a single contact |
| `peach_create_contacts` | Bulk create or upsert contacts |
| `peach_update_contact` | Update a contact by phone number |

### Media
| Tool | Description |
|------|-------------|
| `peach_list_media` | List uploaded media files |
| `peach_upload_media` | Upload a media file (base64) |
| `peach_delete_media` | Delete a media file |

### Messages
| Tool | Description |
|------|-------------|
| `peach_list_messages` | List messages with optional filters |

## Example prompts

- *"Send the order_confirmation template to +14155552671 with order ID 12345"*
- *"Create a new MARKETING template called summer_sale with a body saying 'Get 20% off this weekend!'"*
- *"List all my approved WhatsApp templates"*
- *"Update the contact +14155552671's name to John Smith"*
- *"Launch a broadcast using template promo_v2 to audience list abc123"*
