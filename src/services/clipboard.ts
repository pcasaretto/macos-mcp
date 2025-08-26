import { Context, Effect, Layer } from 'effect'
import { execFile } from 'child_process'
import { promisify } from 'util'
import type { ClipboardCopyOutput, ClipboardPasteOutput, ClipboardClearOutput } from '../schemas/clipboard.ts'

const execFileAsync = promisify(execFile)

export interface ClipboardService {
  readonly copyText: (text: string) => Effect.Effect<ClipboardCopyOutput>
  readonly pasteText: () => Effect.Effect<ClipboardPasteOutput>
  readonly clearClipboard: () => Effect.Effect<ClipboardClearOutput>
}

export const ClipboardService = Context.GenericTag<ClipboardService>('ClipboardService')

const createClipboardServiceLive = Effect.gen(function* (_) {

  const copyText = (text: string): Effect.Effect<ClipboardCopyOutput> =>
    Effect.gen(function* (_) {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          error: 'Clipboard operations are only supported on macOS',
          message: 'Platform not supported'
        }
      }

      const result = yield* _(
        Effect.tryPromise({
          try: () => execFileAsync('sh', ['-c', `printf %s ${JSON.stringify(text)} | pbcopy`]),
          catch: (error) => error as Error
        }).pipe(
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              message: 'Failed to copy text to clipboard'
            })
          )
        )
      )

      if ('success' in result && !result.success) {
        return result as ClipboardCopyOutput
      }

      return {
        success: true,
        message: text === '' ? 'Empty text copied to clipboard' : 'Text copied to clipboard'
      }
    })

  const pasteText = (): Effect.Effect<ClipboardPasteOutput> =>
    Effect.gen(function* (_) {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          error: 'Clipboard operations are only supported on macOS',
          message: 'Platform not supported'
        }
      }

      const result = yield* _(
        Effect.tryPromise({
          try: () => execFileAsync('pbpaste', []),
          catch: (error) => error as Error
        }).pipe(
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              message: 'Failed to read clipboard'
            })
          )
        )
      )

      if ('success' in result && !result.success) {
        return result as ClipboardPasteOutput
      }

      return {
        success: true,
        content: result.stdout,
        message: result.stdout === '' ? 'Clipboard is empty' : 'Clipboard content retrieved'
      }
    })

  const clearClipboard = (): Effect.Effect<ClipboardClearOutput> =>
    Effect.gen(function* (_) {
      if (process.platform !== 'darwin') {
        return {
          success: false,
          error: 'Clipboard operations are only supported on macOS',
          message: 'Platform not supported'
        }
      }

      const result = yield* _(
        Effect.tryPromise({
          try: () => execFileAsync('sh', ['-c', `printf %s '' | pbcopy`]),
          catch: (error) => error as Error
        }).pipe(
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              message: 'Failed to clear clipboard'
            })
          )
        )
      )

      if ('success' in result && !result.success) {
        return result as ClipboardClearOutput
      }

      return {
        success: true,
        message: 'Clipboard cleared'
      }
    })

  return ClipboardService.of({
    copyText,
    pasteText,
    clearClipboard
  })
})

export const ClipboardServiceLive = Layer.effect(
  ClipboardService,
  createClipboardServiceLive
)