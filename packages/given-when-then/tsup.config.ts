import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'given-when-then': './src/index.ts',
    },
    format: ['cjs', 'esm'],
    sourcemap: true
  }
]);
