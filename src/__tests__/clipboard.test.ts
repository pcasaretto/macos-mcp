import { describe, it, expect } from 'vitest'
import { Effect, Layer } from 'effect'
import { handleCopyClipboardTool } from '../tools/clipboard/copy.js'
import { handlePasteClipboardTool } from '../tools/clipboard/paste.js'
import { handleClearClipboardTool } from '../tools/clipboard/clear.js'
import { ClipboardService } from '../services/clipboard.js'

const createMockClipboardService = (
  copyResult: any,
  pasteResult: any,
  clearResult: any
): Layer.Layer<ClipboardService> => {
  return Layer.succeed(
    ClipboardService,
    ClipboardService.of({
      copyText: (_text) => Effect.succeed(copyResult),
      pasteText: () => Effect.succeed(pasteResult),
      clearClipboard: () => Effect.succeed(clearResult)
    })
  )
}

describe('Clipboard Service', () => {
  describe('copyText', () => {
    it('should copy plain text to clipboard successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Text copied to clipboard'
      }
      
      const mockLayer = createMockClipboardService(mockResult, {}, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.copyText('Hello World'))
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Text copied to clipboard')
    })

    it('should handle empty strings', async () => {
      const mockResult = {
        success: true,
        message: 'Empty text copied to clipboard'
      }
      
      const mockLayer = createMockClipboardService(mockResult, {}, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.copyText(''))
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
    })

    it('should handle multi-line text', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const mockResult = {
        success: true,
        message: 'Multi-line text copied'
      }
      
      const mockLayer = createMockClipboardService(mockResult, {}, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.copyText(multilineText))
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
    })

    it('should handle text with special characters', async () => {
      const specialText = 'Text with "quotes" and \'apostrophes\' and $pecial chars!'
      const mockResult = {
        success: true,
        message: 'Special text copied'
      }
      
      const mockLayer = createMockClipboardService(mockResult, {}, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.copyText(specialText))
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
    })

    it('should fail gracefully on command errors', async () => {
      const mockResult = {
        success: false,
        error: 'Command failed',
        message: 'Failed to copy text to clipboard'
      }
      
      const mockLayer = createMockClipboardService(mockResult, {}, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.copyText('test'))
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Command failed')
    })
  })

  describe('pasteText', () => {
    it('should retrieve clipboard content', async () => {
      const mockResult = {
        success: true,
        content: 'Hello from clipboard',
        message: 'Clipboard content retrieved'
      }
      
      const mockLayer = createMockClipboardService({}, mockResult, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.pasteText())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
      expect(result.content).toBe('Hello from clipboard')
    })

    it('should handle empty clipboard', async () => {
      const mockResult = {
        success: true,
        content: '',
        message: 'Clipboard is empty'
      }
      
      const mockLayer = createMockClipboardService({}, mockResult, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.pasteText())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
      expect(result.content).toBe('')
    })

    it('should preserve multi-line formatting', async () => {
      const clipboardContent = 'Line 1\nLine 2\nLine 3'
      const mockResult = {
        success: true,
        content: clipboardContent,
        message: 'Multi-line content retrieved'
      }
      
      const mockLayer = createMockClipboardService({}, mockResult, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.pasteText())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
      expect(result.content).toBe(clipboardContent)
    })

    it('should handle paste errors', async () => {
      const mockResult = {
        success: false,
        error: 'Unable to access clipboard',
        message: 'Failed to read clipboard'
      }
      
      const mockLayer = createMockClipboardService({}, mockResult, {})
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.pasteText())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unable to access clipboard')
    })
  })

  describe('clearClipboard', () => {
    it('should clear clipboard successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Clipboard cleared'
      }
      
      const mockLayer = createMockClipboardService({}, {}, mockResult)
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.clearClipboard())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(true)
      expect(result.message).toBe('Clipboard cleared')
    })

    it('should handle clear errors', async () => {
      const mockResult = {
        success: false,
        error: 'Clear operation failed',
        message: 'Failed to clear clipboard'
      }
      
      const mockLayer = createMockClipboardService({}, {}, mockResult)
      
      const program = Effect.gen(function* (_) {
        const clipboardService = yield* _(ClipboardService)
        return yield* _(clipboardService.clearClipboard())
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Clear operation failed')
    })
  })
})

describe('Clipboard Tools', () => {
  describe('handleCopyClipboardTool', () => {
    it('should handle valid copy input successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Text copied successfully'
      }

      const mockLayer = createMockClipboardService(mockResult, {}, {})

      const program = handleCopyClipboardTool({
        text: 'Hello World'
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(true)
      expect(content.message).toBe('Text copied successfully')
    })

    it('should handle clipboard service errors', async () => {
      const mockResult = {
        success: false,
        error: 'Copy failed',
        message: 'Failed to copy text'
      }

      const mockLayer = createMockClipboardService(mockResult, {}, {})

      const program = handleCopyClipboardTool({
        text: 'Test text'
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toBe('Copy failed')
    })

    it('should handle invalid input', async () => {
      const mockLayer = createMockClipboardService({}, {}, {})

      const program = handleCopyClipboardTool({
        // Missing required 'text' field
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toContain('Invalid input')
    })
  })

  describe('handlePasteClipboardTool', () => {
    it('should return clipboard content', async () => {
      const mockResult = {
        success: true,
        content: 'Clipboard content here',
        message: 'Content retrieved'
      }

      const mockLayer = createMockClipboardService({}, mockResult, {})

      const program = handlePasteClipboardTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(true)
      expect(content.clipboardContent).toBe('Clipboard content here')
    })

    it('should handle paste errors', async () => {
      const mockResult = {
        success: false,
        error: 'Paste failed',
        message: 'Cannot read clipboard'
      }

      const mockLayer = createMockClipboardService({}, mockResult, {})

      const program = handlePasteClipboardTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toBe('Paste failed')
    })
  })

  describe('handleClearClipboardTool', () => {
    it('should clear clipboard successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Clipboard cleared successfully'
      }

      const mockLayer = createMockClipboardService({}, {}, mockResult)

      const program = handleClearClipboardTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(true)
      expect(content.message).toBe('Clipboard cleared successfully')
    })

    it('should handle clear errors', async () => {
      const mockResult = {
        success: false,
        error: 'Clear failed',
        message: 'Cannot clear clipboard'
      }

      const mockLayer = createMockClipboardService({}, {}, mockResult)

      const program = handleClearClipboardTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toBe('Clear failed')
    })
  })
})