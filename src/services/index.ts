import { Layer } from 'effect'
import { NotificationServiceLive } from './notification.js'
import { ClipboardServiceLive } from './clipboard.js'

/**
 * Auto-discovery of all service layers
 * 
 * This module automatically exports and combines all service layers.
 * When adding a new service:
 * 1. Create your service file with a `*ServiceLive` export
 * 2. Import and add it to the serviceLayers array below
 * 3. That's it! The service will be available to all tools
 * 
 * This pattern keeps service registration centralized but explicit,
 * making it easy to see all available services at a glance.
 */

/**
 * Array of all service layers in the application
 * Add new service layers here when creating new services
 */
const serviceLayers = [
  NotificationServiceLive,
  ClipboardServiceLive
  // New services go here
] as const

/**
 * Combined service layer containing all application services
 * This is automatically generated from the serviceLayers array
 */
export const allServices = serviceLayers.reduce(
  (combined, service) => Layer.merge(combined, service),
  Layer.empty
)

/**
 * Individual service exports for direct use if needed
 */
export { NotificationServiceLive } from './notification.js'
export { ClipboardServiceLive } from './clipboard.js'