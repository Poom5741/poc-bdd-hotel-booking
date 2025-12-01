import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['fixtures.ts', 'steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
        cucumberReporter('html', {
          outputFile: 'cucumber-report/index.html',
          externalAttachments: true,
        }),
        ['html', { open: 'never' }],
      ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      // retries: 3,
    },
  ],
});

// export default defineConfig({
//   testDir,
//   reporter: [
//     cucumberReporter('html', {
//       outputFile: 'cucumber-report/index.html',
//       externalAttachments: true,
//     }),
//     ['html', { open: 'never' }],
//   ],
//   use: {
//     screenshot: 'on',
//     trace: 'on',
//   },
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },
//   ],
// });