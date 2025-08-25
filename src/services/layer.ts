import { Layer } from 'effect'
import { NotificationServiceLive } from './notification.js'
import { ClipboardServiceLive } from './clipboard.js'
import { ExecutorServiceLive } from './executor.js'

/**
 * Central application layer that provides all services
 * 
 * This layer combines all services with their dependencies resolved:
 * - ExecutorService: Foundation for command execution
 * - ClipboardService: Requires ExecutorService
 * - NotificationService: Standalone service
 * 
 * New services can be added here and will automatically be available
 * to all tools through dependency injection.
 */
export const AppServiceLayer = Layer.merge(
  NotificationServiceLive,
  ClipboardServiceLive
).pipe(
  Layer.provide(ExecutorServiceLive)
)

/**
 * Type representing all available services in the application layer
 * This type will automatically expand as new services are added to AppServiceLayer
 */
export type AppServices = Layer.Layer.Success<typeof AppServiceLayer>