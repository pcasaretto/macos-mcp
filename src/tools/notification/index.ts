import type { ToolGroup } from '../registry.js'
import { handleNotifyTool } from '../notify.js'
import { handleCheckEnvironmentTool } from '../check-env.js'
import { notifyInputToJsonSchema } from '../../schemas/notify.js'

export const notificationTools: ToolGroup = {
  name: 'notification',
  tools: [
    {
      name: 'notify',
      description: 'Display a macOS notification via AppleScript',
      inputSchema: notifyInputToJsonSchema(),
      handler: handleNotifyTool
    },
    {
      name: 'checkEnvironment',
      description: 'Check if the environment supports macOS notifications',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: () => handleCheckEnvironmentTool()
    }
  ]
}