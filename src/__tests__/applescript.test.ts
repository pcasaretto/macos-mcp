import { describe, it, expect } from 'vitest'
import { escapeAppleScriptString, buildDisplayNotificationScript } from '../services/applescript.js'

describe('AppleScript utilities', () => {
  describe('escapeAppleScriptString', () => {
    it('should escape double quotes', () => {
      expect(escapeAppleScriptString('Hello "world"')).toBe('Hello \\"world\\"')
    })

    it('should escape backslashes', () => {
      expect(escapeAppleScriptString('Path\\to\\file')).toBe('Path\\\\to\\\\file')
    })

    it('should escape both quotes and backslashes', () => {
      expect(escapeAppleScriptString('Path\\to\\"file"')).toBe('Path\\\\to\\\\\\"file\\"')
    })

    it('should handle strings with newlines', () => {
      expect(escapeAppleScriptString('Line 1\nLine 2')).toBe('Line 1\nLine 2')
    })

    it('should handle strings with tabs', () => {
      expect(escapeAppleScriptString('Col1\tCol2')).toBe('Col1\tCol2')
    })

    it('should handle empty strings', () => {
      expect(escapeAppleScriptString('')).toBe('')
    })

    it('should handle strings with only special characters', () => {
      expect(escapeAppleScriptString('"""')).toBe('\\"\\"\\"')
      expect(escapeAppleScriptString('\\\\\\')).toBe('\\\\\\\\\\\\')
    })
  })

  describe('buildDisplayNotificationScript', () => {
    it('should build basic notification script', () => {
      const result = buildDisplayNotificationScript({
        title: 'Test Title',
        message: 'Test Message'
      })
      expect(result).toBe('display notification "Test Message" with title "Test Title"')
    })

    it('should include subtitle when provided', () => {
      const result = buildDisplayNotificationScript({
        title: 'Test Title',
        message: 'Test Message',
        subtitle: 'Test Subtitle'
      })
      expect(result).toBe('display notification "Test Message" with title "Test Title" subtitle "Test Subtitle"')
    })

    it('should include sound when provided', () => {
      const result = buildDisplayNotificationScript({
        title: 'Test Title',
        message: 'Test Message',
        sound: 'Sosumi'
      })
      expect(result).toBe('display notification "Test Message" with title "Test Title" sound name "Sosumi"')
    })

    it('should include both subtitle and sound when provided', () => {
      const result = buildDisplayNotificationScript({
        title: 'Test Title',
        message: 'Test Message',
        subtitle: 'Test Subtitle',
        sound: 'Glass'
      })
      expect(result).toBe('display notification "Test Message" with title "Test Title" subtitle "Test Subtitle" sound name "Glass"')
    })

    it('should properly escape special characters in all fields', () => {
      const result = buildDisplayNotificationScript({
        title: 'Title with "quotes"',
        message: 'Message with \\ backslash',
        subtitle: 'Subtitle with "quotes" and \\ backslash',
        sound: 'Sound\\Name'
      })
      expect(result).toBe('display notification "Message with \\\\ backslash" with title "Title with \\"quotes\\"" subtitle "Subtitle with \\"quotes\\" and \\\\ backslash" sound name "Sound\\\\Name"')
    })

    it('should handle complex mixed content', () => {
      const result = buildDisplayNotificationScript({
        title: 'Build "Success"',
        message: 'The build completed successfully!\nNo errors found.',
        subtitle: 'Project: my\\project',
        sound: 'Hero'
      })
      expect(result).toBe('display notification "The build completed successfully!\nNo errors found." with title "Build \\"Success\\"" subtitle "Project: my\\\\project" sound name "Hero"')
    })
  })
})