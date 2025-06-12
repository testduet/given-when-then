/* eslint-disable */

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.vitest.?(c|m)[jt]s?(x)']
  }
});
