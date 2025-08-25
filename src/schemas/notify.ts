import { Schema } from '@effect/schema'

export const NotifyInputSchema = Schema.Struct({
  title: Schema.String,
  message: Schema.String,
  subtitle: Schema.optional(Schema.String),
  sound: Schema.optional(Schema.String),
  group: Schema.optional(Schema.String)
})

export const NotifyOutputSchema = Schema.Struct({
  ok: Schema.Boolean,
  stdout: Schema.String,
  stderr: Schema.String
})

export const CheckEnvironmentOutputSchema = Schema.Struct({
  ok: Schema.Boolean,
  platform: Schema.String,
  hasOsascript: Schema.Boolean,
  notes: Schema.String
})

export type NotifyInput = typeof NotifyInputSchema.Type
export type NotifyOutput = typeof NotifyOutputSchema.Type
export type CheckEnvironmentOutput = typeof CheckEnvironmentOutputSchema.Type

export const notifyInputToJsonSchema = () => {
  return {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string' as const,
        description: 'The title of the notification'
      },
      message: {
        type: 'string' as const, 
        description: 'The main notification message'
      },
      subtitle: {
        type: 'string' as const,
        description: 'Optional subtitle for the notification'
      },
      sound: {
        type: 'string' as const,
        description: 'Optional sound name to play with the notification'
      },
      group: {
        type: 'string' as const,
        description: 'Optional group identifier for notification coalescing'
      }
    },
    required: ['title', 'message'] as string[]
  }
}