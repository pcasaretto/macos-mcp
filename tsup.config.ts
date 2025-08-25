import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  bundle: true,
  shims: true,
  esbuildOptions: (options) => {
    options.platform = 'node'
    options.packages = 'external'
  }
})