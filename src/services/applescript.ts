import { Effect } from 'effect'

export interface AppleScriptInput {
  readonly title: string
  readonly message: string
  readonly subtitle?: string
  readonly sound?: string
}

export const escapeAppleScriptString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
}

export const buildDisplayNotificationScript = (input: AppleScriptInput): string => {
  const escapedMessage = escapeAppleScriptString(input.message)
  const escapedTitle = escapeAppleScriptString(input.title)
  
  let script = `display notification "${escapedMessage}" with title "${escapedTitle}"`
  
  if (input.subtitle) {
    const escapedSubtitle = escapeAppleScriptString(input.subtitle)
    script += ` subtitle "${escapedSubtitle}"`
  }
  
  if (input.sound) {
    const escapedSound = escapeAppleScriptString(input.sound)
    script += ` sound name "${escapedSound}"`
  }
  
  return script
}

export const validateAppleScriptInput = (input: unknown): Effect.Effect<AppleScriptInput, Error> => {
  return Effect.try(() => {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object')
    }
    
    const obj = input as Record<string, unknown>
    
    if (typeof obj.title !== 'string' || obj.title.trim() === '') {
      throw new Error('Title must be a non-empty string')
    }
    
    if (typeof obj.message !== 'string' || obj.message.trim() === '') {
      throw new Error('Message must be a non-empty string')
    }
    
    const result: any = {
      title: obj.title.trim(),
      message: obj.message.trim()
    }
    
    if (obj.subtitle !== undefined) {
      if (typeof obj.subtitle !== 'string') {
        throw new Error('Subtitle must be a string')
      }
      result.subtitle = obj.subtitle.trim()
    }
    
    if (obj.sound !== undefined) {
      if (typeof obj.sound !== 'string') {
        throw new Error('Sound must be a string')
      }
      result.sound = obj.sound.trim()
    }
    
    return result as AppleScriptInput
  })
}