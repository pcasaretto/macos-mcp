import { Context, Effect, Layer, Ref, Schedule } from 'effect'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { buildDisplayNotificationScript } from './applescript.ts'
import type { NotifyInput, NotifyOutput, CheckEnvironmentOutput } from '../schemas/notify.ts'

const execFileAsync = promisify(execFile)

export interface NotificationService {
  readonly sendNotification: (input: NotifyInput) => Effect.Effect<NotifyOutput>
  readonly checkEnvironment: () => Effect.Effect<CheckEnvironmentOutput>
}

export const NotificationService = Context.GenericTag<NotificationService>('NotificationService')

interface RateLimitState {
  readonly count: number
  readonly windowStart: number
}

const createNotificationServiceLive = Effect.gen(function* (_) {
  const rateLimitRef = yield* _(Ref.make<RateLimitState>({
    count: 0,
    windowStart: Date.now()
  }))

  const maxNotificationsPerWindow = parseInt(process.env.NOTIFY_MAX_PER_10S ?? '5', 10)
  const windowDurationMs = 10000

  const checkRateLimit = Effect.gen(function* (_) {
    const now = Date.now()
    const currentState = yield* _(Ref.get(rateLimitRef))

    if (now - currentState.windowStart > windowDurationMs) {
      yield* _(Ref.set(rateLimitRef, { count: 1, windowStart: now }))
      return true
    }

    if (currentState.count >= maxNotificationsPerWindow) {
      return false
    }

    yield* _(Ref.update(rateLimitRef, state => ({ ...state, count: state.count + 1 })))
    return true
  })

  const sendNotification = (input: NotifyInput): Effect.Effect<NotifyOutput> =>
    Effect.gen(function* (_) {
      const canProceed = yield* _(checkRateLimit)
      
      if (!canProceed) {
        return {
          ok: false,
          stdout: '',
          stderr: `Rate limit exceeded: maximum ${maxNotificationsPerWindow} notifications per 10 seconds`
        }
      }

      if (process.platform !== 'darwin') {
        return {
          ok: false,
          stdout: '',
          stderr: 'Notifications are only supported on macOS'
        }
      }

      const script = buildDisplayNotificationScript(input)
      
      const result = yield* _(
        Effect.tryPromise({
          try: () => execFileAsync('osascript', ['-e', script]),
          catch: (error) => error as Error
        })
      )

      return {
        ok: true,
        stdout: result.stdout,
        stderr: result.stderr
      }
    }).pipe(
      Effect.catchAll((error) =>
        Effect.succeed({
          ok: false,
          stdout: '',
          stderr: error instanceof Error ? error.message : String(error)
        })
      )
    )

  const checkEnvironment = (): Effect.Effect<CheckEnvironmentOutput> =>
    Effect.gen(function* (_) {
      const platform = process.platform
      const isDarwin = platform === 'darwin'
      
      if (!isDarwin) {
        return {
          ok: false,
          platform,
          hasOsascript: false,
          notes: 'Notifications are only supported on macOS'
        }
      }

      const hasOsascript = yield* _(
        Effect.tryPromise({
          try: () => execFileAsync('which', ['osascript']),
          catch: () => false as const
        }).pipe(
          Effect.map(() => true),
          Effect.catchAll(() => Effect.succeed(false))
        )
      )

      return {
        ok: isDarwin && hasOsascript,
        platform,
        hasOsascript,
        notes: hasOsascript 
          ? 'Environment is ready for notifications' 
          : 'osascript command not found'
      }
    })

  return NotificationService.of({
    sendNotification,
    checkEnvironment
  })
})

export const NotificationServiceLive = Layer.effect(
  NotificationService,
  createNotificationServiceLive
)