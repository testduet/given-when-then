/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['**\/*.vitest.?(c|m)[jt]s?(x)']
  }
});
