import { Layer } from 'effect'
import { allServices } from './index.ts'

/**
 * Central application layer that provides all services
 * 
 * This layer automatically includes all services from the services registry.
 * To add a new service, just add it to services/index.ts - no changes needed here.
 * 
 * Services are automatically discovered and made available to all tools
 * through dependency injection.
 */
export const AppServiceLayer = allServices

/**
 * Type representing all available services in the application layer
 * This type will automatically expand as new services are added to AppServiceLayer
 */
export type AppServices = Layer.Layer.Success<typeof AppServiceLayer>