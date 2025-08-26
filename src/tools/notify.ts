import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import { CallToolRequestSchema, type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { NotificationService } from '../services/notification.ts'
import { NotifyInputSchema } from '../schemas/notify.ts'

export const handleNotifyTool = (args: unknown): Effect.Effect<CallToolResult, Error, NotificationService> =>
  Effect.gen(function* (_) {
    const notificationService = yield* _(NotificationService)
    
    const parsedInputResult = yield* _(
      Effect.try(() => Schema.decodeUnknownSync(NotifyInputSchema)(args))
        .pipe(
          Effect.mapError(error => 
            new Error(`Invalid input for notify tool: ${error}`)
          ),
          Effect.either
        )
    )

    if (parsedInputResult._tag === 'Left') {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: parsedInputResult.left.message,
              details: 'Input validation failed'
            }, null, 2)
          }
        ],
        isError: true
      }
    }

    const parsedInput = parsedInputResult.right
    const result = yield* _(notificationService.sendNotification(parsedInput))

    if (result.ok) {
      return {
        content: [
          {
            type: 'text' as const,
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
            type: 'text' as const,
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