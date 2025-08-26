# MCP macOS

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides macOS system integration capabilities to LLMs via AppleScript. Built with [Effect TS](https://effect.website/) for robust error handling and resource management.

## Features

- 🍎 **macOS Native Notifications**: Uses AppleScript's `display notification` for system-native notifications
- 🛡️ **Type-Safe & Robust**: Built with Effect TS and comprehensive error handling
- 🔒 **Rate Limited**: Prevents notification spam with configurable rate limiting (default: 5 per 10 seconds)
- 🏗️ **Reproducible Builds**: Uses Nix flakes for reproducible dependency management
- 📝 **MCP Compliant**: Implements the full MCP specification with proper tool definitions
- ⚡ **Single Binary**: Compiles to a standalone executable for easy deployment

## Requirements

- **macOS**: This server only works on macOS systems
- **Node.js 24+**: Required for native TypeScript support
- **osascript**: Must be available in PATH (comes with macOS)
- **Nix** (for building): [Install Nix](https://nixos.org/download.html) with flakes enabled

## Quick Start

### Using Nix (Recommended)

```bash
# Clone and enter the project
git clone <repository-url>
cd macos-mcp

# Enter development environment
nix develop

# Install dependencies
npm install

# Run in development mode
npm run dev

# Or build and run
nix build
nix run
```

### Manual Setup

```bash
# Install Node.js 24+ and dependencies
npm install

# Run the server directly (no build needed!)
npm start

# Or run TypeScript directly
node --experimental-strip-types src/index.ts
```

## Tools

### `notify`

Display a native macOS notification.

**Input Schema:**
```json
{
  "title": "string (required)",
  "message": "string (required)",
  "subtitle": "string (optional)",
  "sound": "string (optional)",
  "group": "string (optional)"
}
```

**Example:**
```json
{
  "title": "Build Complete",
  "message": "Your project built successfully!",
  "subtitle": "No errors found",
  "sound": "Hero"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "title": "Build Complete",
  "subtitle": "No errors found"
}
```

### `checkEnvironment`

Verify the system supports notifications.

**Input:** None

**Output:**
```json
{
  "environment": {
    "ok": true,
    "platform": "darwin",
    "hasOsascript": true,
    "notes": "Environment is ready for notifications"
  },
  "recommendations": [
    "Your system is ready to send notifications"
  ]
}
```

## Integration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "macos-notify": {
      "command": "nix",
      "args": ["run", "/path/to/macos-mcp#default"]
    }
  }
}
```

For development (local directory):
```json
{
  "mcpServers": {
    "macos-notify": {
      "command": "nix",
      "args": ["run", "."]
    }
  }
}
```

### MCP Inspector

Test the server interactively:

```bash
# Install mcp-inspector
npm install -g @modelcontextprotocol/inspector

# Run with Nix
npx @modelcontextprotocol/inspector nix run /path/to/macos-mcp#default

# Or from local directory
npx @modelcontextprotocol/inspector nix run .
```

## Configuration

### Environment Variables

- `NOTIFY_MAX_PER_10S`: Maximum notifications per 10-second window (default: 5)

### Rate Limiting

The server implements in-memory rate limiting to prevent notification spam:
- Default: 5 notifications per 10 seconds
- Configurable via `NOTIFY_MAX_PER_10S` environment variable
- Exceeding limits returns structured error responses

## Development

### Commands

```bash
npm run dev          # Run in watch mode
npm start           # Run the server directly
npm test            # Run tests
npm run test:run    # Run tests once
npm run typecheck   # Type checking (no emission)
npm run lint        # Run ESLint
```

### Project Structure

```
src/
├── index.ts              # CLI entrypoint (executable with Node 24)
├── server.ts             # MCP server implementation
├── services/
│   ├── applescript.ts    # AppleScript utilities & escaping
│   ├── clipboard.ts      # Clipboard operations
│   ├── notification.ts   # NotificationService with Effect
│   └── layer.ts          # Effect layers
├── tools/
│   ├── notify.ts         # Notify tool handler
│   ├── check-env.ts      # Environment check tool
│   └── clipboard/        # Clipboard tool handlers
├── schemas/
│   ├── notify.ts         # Notification schemas
│   └── clipboard.ts      # Clipboard schemas
└── __tests__/
    ├── applescript.test.ts  # AppleScript escaping tests
    ├── clipboard.test.ts    # Clipboard tests
    └── tools.test.ts        # Tool integration tests
```

### Testing

The project includes comprehensive tests:

- **Unit tests**: AppleScript string escaping with edge cases
- **Integration tests**: MCP tool handlers with mocked services
- **Manual testing**: Instructions for mcp-inspector and Claude Desktop

```bash
npm test    # Run all tests with Vitest
```

## Nix Development

### Build System

This project uses **Nix flakes** with Node.js 24's native TypeScript support:

- **Node version**: 24 (with `--experimental-strip-types` support)
- **No build step**: TypeScript runs directly without transpilation
- **Simple packaging**: Direct execution of source files

### Available Nix Commands

```bash
nix develop          # Enter development shell
nix build           # Build the package
nix run             # Run the server
nix flake check     # Validate the flake
```

### Development Shell

The `nix develop` shell provides:
- Node.js 24 with native TypeScript support
- TypeScript language server for IDE support
- Development utilities (jq)
- All required development dependencies

## Security & Safety

### AppleScript Injection Prevention

The server implements robust AppleScript string escaping:
- Escapes double quotes (`"` → `\"`)
- Escapes backslashes (`\` → `\\`)
- Handles newlines and tabs safely
- Uses `execFile` instead of `exec` for subprocess safety

### Error Handling

All operations use Effect TS for structured error handling:
- Type-safe error propagation
- Resource cleanup guarantees
- Graceful degradation on unsupported platforms

## Troubleshooting

### Common Issues

**"Notifications are only supported on macOS"**
- This server only works on macOS systems
- Other platforms will receive structured error responses

**"osascript command not found"**
- Ensure you're on macOS with Command Line Tools installed
- Run: `xcode-select --install`

**"Rate limit exceeded"**
- Default limit: 5 notifications per 10 seconds
- Adjust with `NOTIFY_MAX_PER_10S` environment variable
- Wait for the rate limit window to reset

**Notifications attributed to "osascript"**
- This is normal macOS behavior
- You may need to allow notifications for Terminal or your MCP client
- Go to System Settings → Notifications → [Application]

### Debugging

Enable verbose logging:
```bash
DEBUG=1 nix run .
```

Test notification manually:
```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"notify","arguments":{"title":"Test","message":"Hello World"}},"id":1}' | nix run .
```

## License

MIT - see [LICENSE](LICENSE) file for details.

## Contributing

1. Ensure you have Nix with flakes enabled
2. Run `nix develop` to enter the development environment  
3. Make your changes and add tests
4. Run `npm test` to verify everything works
5. Submit a pull request

## Roadmap

- [ ] Support for notification actions/buttons
- [ ] Notification history and management
- [ ] Custom notification icons
- [ ] Integration with macOS Focus modes
- [ ] Batch notification operations