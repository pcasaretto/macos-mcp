import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ClipboardService } from '../../services/clipboard.ts'
import { ClipboardCopyInputSchema } from '../../schemas/clipboard.ts'

export const handleCopyClipboardTool = (args: unknown): Effect.Effect<CallToolResult, Error, ClipboardService> =>
  Effect.gen(function* (_) {
    const clipboardService = yield* _(ClipboardService)
    
    const parsedInputResult = yield* _(
      Effect.try(() => Schema.decodeUnknownSync(ClipboardCopyInputSchema)(args))
        .pipe(
          Effect.mapError(error => 
            new Error(`Invalid input for clipboard copy tool: ${error}`)
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
    const result = yield* _(clipboardService.copyText(parsedInput.text))

    if (result.success) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              message: result.message,
              textLength: parsedInput.text.length
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
              error: result.error,
              message: result.message
            }, null, 2)
          }
        ],
        isError: true
      }
    }
  })