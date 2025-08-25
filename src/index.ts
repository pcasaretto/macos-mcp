#!/usr/bin/env node

import { Effect, Runtime } from 'effect'
import { runServer } from './server.js'

const main = Effect.gen(function* (_) {
  yield* _(runServer)
})

const runtime = Runtime.defaultRuntime

Runtime.runPromiseExit(runtime)(main)
  .then((exit) => {
    if (exit._tag === 'Failure') {
      console.error('Application failed:', exit.cause)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })