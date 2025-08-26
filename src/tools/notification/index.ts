import type { ToolGroup } from '../registry.ts'
import { handleNotifyTool } from '../notify.ts'
import { handleCheckEnvironmentTool } from '../check-env.ts'
import { notifyInputToJsonSchema } from '../../schemas/notify.ts'

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