import { Effect } from 'effect'
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { NotificationService } from '../services/notification.ts'

export const handleCheckEnvironmentTool = (): Effect.Effect<CallToolResult, Error, NotificationService> =>
  Effect.gen(function* (_) {
    const notificationService = yield* _(NotificationService)
    
    const result = yield* _(notificationService.checkEnvironment())

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            environment: {
              ok: result.ok,
              platform: result.platform,
              hasOsascript: result.hasOsascript,
              notes: result.notes
            },
            recommendations: result.ok 
              ? ['Your system is ready to send notifications']
              : result.platform !== 'darwin'
                ? ['This tool only works on macOS systems']
                : ['Please ensure osascript is available in your PATH']
          }, null, 2)
        }
      ]
    }
  })