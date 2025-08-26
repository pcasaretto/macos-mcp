import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Effect, Layer } from 'effect'
import { handleNotifyTool } from '../tools/notify.ts'
import { handleCheckEnvironmentTool } from '../tools/check-env.ts'
import { NotificationService } from '../services/notification.ts'
import type { NotificationService as NotificationServiceType } from '../services/notification.ts'

const createMockNotificationService = (
  sendResult: any,
  checkResult: any
): Layer.Layer<NotificationService> => {
  return Layer.succeed(
    NotificationService,
    NotificationService.of({
      sendNotification: (_input) => Effect.succeed(sendResult),
      checkEnvironment: () => Effect.succeed(checkResult)
    })
  )
}

describe('MCP Tools', () => {
  describe('handleNotifyTool', () => {
    it('should handle valid notify input successfully', async () => {
      const mockResult = {
        ok: true,
        stdout: 'Notification sent',
        stderr: ''
      }

      const mockLayer = createMockNotificationService(mockResult, {})

      const program = handleNotifyTool({
        title: 'Test Title',
        message: 'Test Message'
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(true)
      expect(content.title).toBe('Test Title')
    })

    it('should handle notification service errors', async () => {
      const mockResult = {
        ok: false,
        stdout: '',
        stderr: 'Rate limit exceeded'
      }

      const mockLayer = createMockNotificationService(mockResult, {})

      const program = handleNotifyTool({
        title: 'Test Title',
        message: 'Test Message'
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toBe('Rate limit exceeded')
    })

    it('should handle invalid input', async () => {
      const mockLayer = createMockNotificationService({}, {})

      const program = handleNotifyTool({
        title: 'Test Title'
        // Missing required 'message' field
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.isError).toBe(true)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(false)
      expect(content.error).toContain('Invalid input for notify tool')
      expect(content.details).toBe('Input validation failed')
    })

    it('should handle input with all optional fields', async () => {
      const mockResult = {
        ok: true,
        stdout: 'Notification sent',
        stderr: ''
      }

      const mockLayer = createMockNotificationService(mockResult, {})

      const program = handleNotifyTool({
        title: 'Test Title',
        message: 'Test Message',
        subtitle: 'Test Subtitle',
        sound: 'Sosumi',
        group: 'test-group'
      })

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.success).toBe(true)
      expect(content.subtitle).toBe('Test Subtitle')
    })
  })

  describe('handleCheckEnvironmentTool', () => {
    it('should return environment check results for macOS', async () => {
      const mockCheckResult = {
        ok: true,
        platform: 'darwin',
        hasOsascript: true,
        notes: 'Environment is ready for notifications'
      }

      const mockLayer = createMockNotificationService({}, mockCheckResult)

      const program = handleCheckEnvironmentTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.environment.ok).toBe(true)
      expect(content.environment.platform).toBe('darwin')
      expect(content.environment.hasOsascript).toBe(true)
      expect(content.recommendations).toContain('Your system is ready to send notifications')
    })

    it('should return environment check results for non-macOS', async () => {
      const mockCheckResult = {
        ok: false,
        platform: 'linux',
        hasOsascript: false,
        notes: 'Notifications are only supported on macOS'
      }

      const mockLayer = createMockNotificationService({}, mockCheckResult)

      const program = handleCheckEnvironmentTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      
      const content = JSON.parse(result.content[0].text)
      expect(content.environment.ok).toBe(false)
      expect(content.environment.platform).toBe('linux')
      expect(content.recommendations).toContain('This tool only works on macOS systems')
    })

    it('should handle missing osascript on macOS', async () => {
      const mockCheckResult = {
        ok: false,
        platform: 'darwin',
        hasOsascript: false,
        notes: 'osascript command not found'
      }

      const mockLayer = createMockNotificationService({}, mockCheckResult)

      const program = handleCheckEnvironmentTool()

      const result = await Effect.runPromise(program.pipe(Effect.provide(mockLayer)))

      expect(result.content).toHaveLength(1)
      
      const content = JSON.parse(result.content[0].text)
      expect(content.environment.ok).toBe(false)
      expect(content.environment.platform).toBe('darwin')
      expect(content.environment.hasOsascript).toBe(false)
      expect(content.recommendations).toContain('Please ensure osascript is available in your PATH')
    })
  })
})