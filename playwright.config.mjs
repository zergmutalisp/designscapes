import { defineConfig, devices } from '@playwright/test';

const baseURL = `${process.env.APP_BASE_URL || 'http://127.0.0.1:5173'}/`.replace(/\/\/$/, '/');

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: process.env.APP_BASE_URL
    ? undefined
    : {
        command: 'python3 -m http.server 5173 --bind 127.0.0.1',
        url: baseURL,
        reuseExistingServer: true
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
