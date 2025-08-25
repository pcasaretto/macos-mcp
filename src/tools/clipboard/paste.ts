import { Effect } from 'effect'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { ClipboardService } from '../../services/clipboard.js'

export const handlePasteClipboardTool = (): Effect.Effect<CallToolResult, Error, ClipboardService> =>
  Effect.gen(function* (_) {
    const clipboardService = yield* _(ClipboardService)
    
    const result = yield* _(clipboardService.pasteText())

    if (result.success) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              message: result.message,
              clipboardContent: result.content,
              contentLength: result.content?.length || 0
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