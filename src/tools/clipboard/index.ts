import type { ToolGroup } from '../registry.js'
import { handleCopyClipboardTool } from './copy.js'
import { handlePasteClipboardTool } from './paste.js'
import { handleClearClipboardTool } from './clear.js'
import { 
  clipboardCopyInputToJsonSchema, 
  clipboardPasteInputToJsonSchema, 
  clipboardClearInputToJsonSchema 
} from '../../schemas/clipboard.js'

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