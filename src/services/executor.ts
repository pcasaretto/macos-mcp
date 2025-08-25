import { Context, Effect, Layer } from 'effect'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface ExecutorService {
  readonly executeCommand: (command: string, args: string[]) => Effect.Effect<{ stdout: string, stderr: string }>
  readonly executePbcopy: (text: string) => Effect.Effect<{ stdout: string, stderr: string }>
  readonly executePbpaste: () => Effect.Effect<{ stdout: string, stderr: string }>
}

export const ExecutorService = Context.GenericTag<ExecutorService>('ExecutorService')

const createExecutorServiceLive = Effect.gen(function* (_) {
  const executeCommand = (command: string, args: string[]): Effect.Effect<{ stdout: string, stderr: string }> =>
    Effect.tryPromise({
      try: () => execFileAsync(command, args),
      catch: (error) => error as Error
    })

  const executePbcopy = (text: string): Effect.Effect<{ stdout: string, stderr: string }> =>
    Effect.tryPromise({
      try: () => execFileAsync('sh', ['-c', `printf %s ${JSON.stringify(text)} | pbcopy`]),
      catch: (error) => error as Error
    })

  const executePbpaste = (): Effect.Effect<{ stdout: string, stderr: string }> =>
    executeCommand('pbpaste', [])

  return ExecutorService.of({
    executeCommand,
    executePbcopy,
    executePbpaste
  })
})

export const ExecutorServiceLive = Layer.effect(
  ExecutorService,
  createExecutorServiceLive
)