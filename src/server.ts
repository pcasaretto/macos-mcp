import { Effect, Layer } from 'effect'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolResult,
  type Tool
} from '@modelcontextprotocol/sdk/types.js'
import { NotificationServiceLive } from './services/notification.js'
import { handleNotifyTool } from './tools/notify.js'
import { handleCheckEnvironmentTool } from './tools/check-env.js'
import { notifyInputToJsonSchema } from './schemas/notify.js'

const createMCPServer = Effect.gen(function* (_) {
  const server = new Server(
    {
      name: 'mcp-macos-notify',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )

  const tools: Tool[] = [
    {
      name: 'notify',
      description: 'Display a macOS notification via AppleScript',
      inputSchema: notifyInputToJsonSchema()
    },
    {
      name: 'checkEnvironment',
      description: 'Check if the environment supports macOS notifications',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ]

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    const handleTool = (name: string, args: unknown): Effect.Effect<CallToolResult, Error> => {
      switch (name) {
        case 'notify':
          return handleNotifyTool(args)
        case 'checkEnvironment':
          return handleCheckEnvironmentTool()
        default:
          return Effect.fail(new Error(`Unknown tool: ${name}`))
      }
    }

    return yield* _(
      handleTool(name, args).pipe(
        Effect.catchAll((error) =>
          Effect.succeed({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error.message,
                  tool: name
                }, null, 2)
              }
            ],
            isError: true
          })
        )
      )
    )
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
  Effect.provide(NotificationServiceLive),
  Effect.catchAll((error) => 
    Effect.sync(() => {
      console.error('Server error:', error)
      process.exit(1)
    })
  )
)