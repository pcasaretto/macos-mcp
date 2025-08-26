import type { ToolGroup } from '../registry.ts'
import { handleCopyClipboardTool } from './copy.ts'
import { handlePasteClipboardTool } from './paste.ts'
import { handleClearClipboardTool } from './clear.ts'
import { 
  clipboardCopyInputToJsonSchema, 
  clipboardPasteInputToJsonSchema, 
  clipboardClearInputToJsonSchema 
} from '../../schemas/clipboard.ts'

export const clipboardTools: ToolGroup = {
  name: 'clipboard',
  tools: [
    {
      name: 'clipboard.copy',
      description: 'Copy text to the macOS clipboard',
      inputSchema: clipboardCopyInputToJsonSchema(),
      handler: handleCopyClipboardTool
    },
    {
      name: 'clipboard.paste',
      description: 'Get current text from the macOS clipboard',
      inputSchema: clipboardPasteInputToJsonSchema(),
      handler: () => handlePasteClipboardTool()
    },
    {
      name: 'clipboard.clear',
      description: 'Clear the macOS clipboard',
      inputSchema: clipboardClearInputToJsonSchema(),
      handler: () => handleClearClipboardTool()
    }
  ]
}