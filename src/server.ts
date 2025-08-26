import { Effect } from 'effect'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolResult,
  type Tool
} from '@modelcontextprotocol/sdk/types.js'
import { toolRegistry, findTool } from './tools/index.ts'
import { AppServiceLayer } from './services/layer.ts'

const createMCPServer = Effect.gen(function* (_) {
  const server = new Server(
    {
      name: 'mcp-macos',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )

  // Convert registry tools to MCP format
  const tools: Tool[] = toolRegistry.allTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    // Find and execute tool from registry
    const tool = findTool(toolRegistry, name)
    if (!tool) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              error: `Unknown tool: ${name}`,
              tool: name
            }, null, 2)
          }
        ],
        isError: true
      }
    }

    const result = await Effect.runPromise(
      tool.handler(args).pipe(
        Effect.catchAll((error) =>
          Effect.succeed({
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({
                  error: error.message,
                  tool: name
                }, null, 2)
              }
            ],
            isError: true
          })
        ),
        Effect.provide(AppServiceLayer)
      )
    )
    
    return result
  })

  return server
})

export const runServer = Effect.gen(function* (_) {
  const server = yield* _(createMCPServer)
  const transport = new StdioServerTransport()
  
  yield* _(
    Effect.promise(() => server.connect(transport))
  )

  process.on('SIGINT', () => {
    server.close().catch(console.error)
  })

  process.on('SIGTERM', () => {
    server.close().catch(console.error)
  })
}).pipe(
  Effect.provide(AppServiceLayer),
  Effect.catchAll((error) => 
    Effect.sync(() => {
      console.error('Server error:', error)
      process.exit(1)
    })
  )
)