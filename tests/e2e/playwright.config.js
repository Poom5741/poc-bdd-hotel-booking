import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features',
  steps: 'steps/**/*.js',
});

export default defineConfig({
  testDir,
  // other config
});