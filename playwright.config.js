import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    testMatch: "**/*.e2e.js",
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:4173",
        browserName: "chromium",
        headless: true
    },
    webServer: {
        command: "npm run start",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI
    }
});
