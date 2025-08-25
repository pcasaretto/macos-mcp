# macOS MCP Server - Feature Ideas

## Project Evolution
Rename from `mcp-macos-notify` to `mcp-macos` - a general-purpose macOS system integration MCP server.

## Potential Features

### 📋 Clipboard
- Copy/paste text, images, rich content
- Clipboard history
- Named clipboard buffers

### 🔍 Search & Files
- Spotlight search (files, apps, content)
- File operations (move, copy, delete to Trash)
- File metadata and tags
- Quick Look previews

### 🖥️ Window Management
- List, move, resize windows
- Screenshots (full, window, region)
- Application launching and control
- Mission Control spaces

### 🗣️ Audio
- Text-to-speech with voice selection
- System/app volume control
- Media playback control (Music, Spotify)
- Now playing information

### 💻 System
- CPU, memory, disk, network stats
- Battery status
- Running processes
- System preferences access

### 📅 Productivity
- Calendar events and reminders
- Do Not Disturb / Focus modes
- Notification management

### 🔐 Security
- Keychain access (with permission)
- File permissions
- Privacy settings status

### 🎯 Automation
- Run AppleScript
- Execute shell commands safely
- Shortcuts app integration
- Automator workflows

### 🌐 Integration Ideas
- Safari bookmarks and reading list
- Mail app integration
- Messages sending (with permission)
- AirDrop file sharing
- HomeKit device control
- Menu bar app control

## Technical Approach
- Keep Effect TS architecture
- One service per feature category
- Graceful permission handling
- Maintain comprehensive testing
- Preserve Nix build system

## Why These Features?
Each feature enables AI assistants to:
- Gather system context
- Automate repetitive tasks
- Provide better user assistance
- Bridge the gap between AI and native OS capabilities