import { Layer } from 'effect'
import { NotificationServiceLive } from './notification.js'
import { ClipboardServiceLive } from './clipboard.js'

/**
 * Central application layer that provides all services
 * 
 * This layer combines all services:
 * - ClipboardService: Handles clipboard operations
 * - NotificationService: Handles system notifications
 * 
 * New services can be added here and will automatically be available
 * to all tools through dependency injection.
 */
export const AppServiceLayer = Layer.merge(
  NotificationServiceLive,
  ClipboardServiceLive
)

/**
 * Type representing all available services in the application layer
 * This type will automatically expand as new services are added to AppServiceLayer
 */
export type AppServices = Layer.Layer.Success<typeof AppServiceLayer>