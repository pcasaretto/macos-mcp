import { Effect, Layer } from 'effect'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type CallToolResult,
  type Tool
} from '@modelcontextprotocol/sdk/types.js'
import { NotificationServiceLive, NotificationService } from './services/notification.js'
import { ClipboardServiceLive, ClipboardService } from './services/clipboard.js'
import { ExecutorServiceLive, ExecutorService } from './services/executor.js'
import { handleNotifyTool } from './tools/notify.js'
import { handleCheckEnvironmentTool } from './tools/check-env.js'
import { handleCopyClipboardTool } from './tools/clipboard/copy.js'
import { handlePasteClipboardTool } from './tools/clipboard/paste.js'
import { handleClearClipboardTool } from './tools/clipboard/clear.js'
import { notifyInputToJsonSchema } from './schemas/notify.js'
import { clipboardCopyInputToJsonSchema, clipboardPasteInputToJsonSchema, clipboardClearInputToJsonSchema } from './schemas/clipboard.js'

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
    },
    {
      name: 'clipboard.copy',
      description: 'Copy text to the macOS clipboard',
      inputSchema: clipboardCopyInputToJsonSchema()
    },
    {
      name: 'clipboard.paste',
      description: 'Get current text from the macOS clipboard',
      inputSchema: clipboardPasteInputToJsonSchema()
    },
    {
      name: 'clipboard.clear',
      description: 'Clear the macOS clipboard',
      inputSchema: clipboardClearInputToJsonSchema()
    }
  ]

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    const handleTool = (name: string, args: unknown): Effect.Effect<CallToolResult, Error, NotificationService | ClipboardService> => {
      switch (name) {
        case 'notify':
          return handleNotifyTool(args)
        case 'checkEnvironment':
          return handleCheckEnvironmentTool()
        case 'clipboard.copy':
          return handleCopyClipboardTool(args)
        case 'clipboard.paste':
          return handlePasteClipboardTool()
        case 'clipboard.clear':
          return handleClearClipboardTool()
        default:
          return Effect.fail(new Error(`Unknown tool: ${name}`))
      }
    }

    const result = await Effect.runPromise(
      handleTool(name, args).pipe(
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
        Effect.provide(Layer.merge(NotificationServiceLive, ClipboardServiceLive.pipe(Layer.provide(ExecutorServiceLive))))
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
  Effect.provide(Layer.merge(NotificationServiceLive, ClipboardServiceLive.pipe(Layer.provide(ExecutorServiceLive)))),
  Effect.catchAll((error) => 
    Effect.sync(() => {
      console.error('Server error:', error)
      process.exit(1)
    })
  )
)