import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import { CallToolRequestSchema, type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { NotificationService } from '../services/notification.js'
import { NotifyInputSchema } from '../schemas/notify.js'

export const handleNotifyTool = (args: unknown): Effect.Effect<CallToolResult, Error> =>
  Effect.gen(function* (_) {
    const notificationService = yield* _(NotificationService)
    
    const parsedInput = yield* _(
      Effect.try(() => Schema.decodeUnknownSync(NotifyInputSchema)(args))
        .pipe(
          Effect.mapError(error => 
            new Error(`Invalid input for notify tool: ${error}`)
          )
        )
    )

    const result = yield* _(notificationService.sendNotification(parsedInput))

    if (result.ok) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Notification sent successfully',
              title: parsedInput.title,
              subtitle: parsedInput.subtitle
            }, null, 2)
          }
        ]
      }
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: result.stderr,
              details: 'Failed to send notification'
            }, null, 2)
          }
        ],
        isError: true
      }
    }
  })