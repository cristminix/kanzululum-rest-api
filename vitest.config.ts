import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true, // Enable global APIs like describe, it, etc.
    setupFiles: ['./setupVitest.ts'], // Optional: path to setup file if needed
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});