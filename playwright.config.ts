import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Desktop Chrome'],
    launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-running-insecure-content', '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] }
  },
  webServer: {
    command: 'npm run start -- -H 0.0.0.0 -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000
  }
});
