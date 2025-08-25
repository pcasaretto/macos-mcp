import { Schema } from '@effect/schema'

export const ClipboardCopyInputSchema = Schema.Struct({
  text: Schema.String
})

export const ClipboardCopyOutputSchema = Schema.Struct({
  success: Schema.Boolean,
  message: Schema.String,
  error: Schema.optional(Schema.String)
})

export const ClipboardPasteOutputSchema = Schema.Struct({
  success: Schema.Boolean,
  content: Schema.optional(Schema.String),
  message: Schema.String,
  error: Schema.optional(Schema.String)
})

export const ClipboardClearOutputSchema = Schema.Struct({
  success: Schema.Boolean,
  message: Schema.String,
  error: Schema.optional(Schema.String)
})

export type ClipboardCopyInput = typeof ClipboardCopyInputSchema.Type
export type ClipboardCopyOutput = typeof ClipboardCopyOutputSchema.Type
export type ClipboardPasteOutput = typeof ClipboardPasteOutputSchema.Type
export type ClipboardClearOutput = typeof ClipboardClearOutputSchema.Type

export const clipboardCopyInputToJsonSchema = () => {
  return {
    type: 'object' as const,
    properties: {
      text: {
        type: 'string' as const,
        description: 'The text content to copy to the clipboard'
      }
    },
    required: ['text'] as string[]
  }
}

export const clipboardPasteInputToJsonSchema = () => {
  return {
    type: 'object' as const,
    properties: {},
    required: [] as string[]
  }
}

export const clipboardClearInputToJsonSchema = () => {
  return {
    type: 'object' as const,
    properties: {},
    required: [] as string[]
  }
}