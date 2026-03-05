# clockodo-mcp

MCP server for the [Clockodo](https://www.clockodo.com) time tracking API.

## Features

- List customers, projects, and services
- Start and stop the stopwatch
- Check running time entries
- Add completed time entries with duration
- Edit existing time entries

## Quickstart

1. Get your Clockodo API key from **My Profile > API Access** in Clockodo
2. Add the server to your MCP client:

```bash
# Claude Code
claude mcp add clockodo -e CLOCKODO_EMAIL=your-email@example.com -e CLOCKODO_API_KEY=your-api-key -- npx clockodo-mcp
```

3. Start using it — ask your AI assistant to track time:

> "Start tracking time for project X"
> "How long have I been tracking?"
> "Stop the clock and log 2 hours for client Y"

## Prerequisites

- Node.js >= 18
- A [Clockodo](https://www.clockodo.com) account with API access
- Your Clockodo email and API key (found under **My Profile > API Access** in Clockodo)

## Configuration

The server requires two environment variables:

| Variable           | Description                 |
| ------------------ | --------------------------- |
| `CLOCKODO_EMAIL`   | Your Clockodo account email |
| `CLOCKODO_API_KEY` | Your Clockodo API key       |

## Usage

### Claude Desktop

Add to your Claude Desktop configuration file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clockodo": {
      "command": "npx",
      "args": ["-y", "clockodo-mcp"],
      "env": {
        "CLOCKODO_EMAIL": "your-email@example.com",
        "CLOCKODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

Add the MCP server to your project or global settings:

```bash
claude mcp add clockodo -e CLOCKODO_EMAIL=your-email@example.com -e CLOCKODO_API_KEY=your-api-key -- npx -y clockodo-mcp
```

Or add it manually to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "clockodo": {
      "command": "npx",
      "args": ["-y", "clockodo-mcp"],
      "env": {
        "CLOCKODO_EMAIL": "your-email@example.com",
        "CLOCKODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

### opencode

Add to your `opencode.json` configuration:

```json
{
  "mcp": {
    "clockodo": {
      "command": "npx",
      "args": ["-y", "clockodo-mcp"],
      "env": {
        "CLOCKODO_EMAIL": "your-email@example.com",
        "CLOCKODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Development

```bash
pnpm install
pnpm test
pnpm run build
```

## License

MIT
