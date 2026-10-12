import { defineConfig, devices } from '@playwright/test'

// 端到端冒烟测试（SPEC 10.4）：iPad 横屏视口。
// CI 上跑 WebKit（最接近 iPad Safari）；本地没有 WebKit 时可以用 ipad-chromium 先跑一遍。
const ipad = devices['iPad Pro 11 landscape']

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/Yoyo-s_Garden/',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    // 默认不开 Service Worker，避免缓存干扰“刷新后状态保持”的检查；e2e/sw.spec.ts 单独打开
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'ipad-webkit', use: { ...ipad } },
    { name: 'ipad-chromium', use: { ...ipad, browserName: 'chromium', isMobile: false } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/Yoyo-s_Garden/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
