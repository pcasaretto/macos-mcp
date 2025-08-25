import { Effect } from 'effect'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

/**
 * JSON Schema definition for tool inputs
 */
export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, any>
  required: string[]
}

/**
 * Complete tool definition that includes all metadata and handler
 */
export interface ToolDefinition {
  /** Tool name (e.g., 'clipboard.copy') */
  readonly name: string
  
  /** Human-readable description of what the tool does */
  readonly description: string
  
  /** JSON Schema for validating tool inputs */
  readonly inputSchema: ToolInputSchema
  
  /** Handler function that processes tool calls */
  readonly handler: (args: unknown) => Effect.Effect<CallToolResult, Error, any>
}

/**
 * Group of related tools (e.g., clipboard tools, notification tools)
 */
export interface ToolGroup {
  /** Group name for organization */
  readonly name: string
  
  /** All tools in this group */
  readonly tools: readonly ToolDefinition[]
}

/**
 * Registry of all available tools
 */
export interface ToolRegistry {
  /** All tool groups */
  readonly groups: readonly ToolGroup[]
  
  /** Flattened list of all tools across groups */
  readonly allTools: readonly ToolDefinition[]
}

/**
 * Create a tool registry from groups
 */
export const createToolRegistry = (groups: readonly ToolGroup[]): ToolRegistry => ({
  groups,
  allTools: groups.flatMap(group => group.tools)
})

/**
 * Find a tool by name in the registry
 */
export const findTool = (registry: ToolRegistry, name: string): ToolDefinition | undefined =>
  registry.allTools.find(tool => tool.name === name)