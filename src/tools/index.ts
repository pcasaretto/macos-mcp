import { createToolRegistry } from './registry.ts'
import { notificationTools } from './notification/index.ts'
import { clipboardTools } from './clipboard/index.ts'

/**
 * All available tool groups in the MCP server
 * 
 * To add a new tool group:
 * 1. Create the group directory and implementation
 * 2. Import it here
 * 3. Add it to the toolGroups array
 * 
 * The registry will automatically discover all tools and make them available.
 */
export const toolGroups = [
  notificationTools,
  clipboardTools
  // Future tool groups go here
] as const

/**
 * Complete tool registry with all available tools
 */
export const toolRegistry = createToolRegistry(toolGroups)

/**
 * Convenience exports
 */
export const { allTools } = toolRegistry
export { findTool } from './registry.ts'