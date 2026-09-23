import { expect, test } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = resolve(root, process.env.HIMART_ARTIFACT_DIR ?? "artifacts");
let server;
let pageUrl;
const titles = [
  "왜 고객들이 하이마트를 선택하지 않는지부터 확인했습니다.",
  "그리고 실제로 고객들이 서비스를 어떻게 이용하고 있는지도 살펴봤습니다.",
  "앞선 데이터를 바탕으로, 구매 여정의 흐름과 각 화면의 역할을 다시 정의했습니다.",
  "정의한 흐름과 여정별 정의를 바탕으로 빠르게 프로토타입을 만들고, 검증을 반복하고 있습니다.",
];

async function revealEntirePage(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.max(12, Math.ceil(pageHeight / Math.max(viewportHeight, 1)));

  for (let step = 0; step <= steps; step += 1) {
    await page.evaluate(({ step, steps, pageHeight }) => window.scrollTo(0, Math.round((pageHeight * step) / steps)), { step, steps, pageHeight });
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const filePath = resolve(root, `.${pathname === "/" ? "/himart-optimized-test.html" : pathname}`);

    if (filePath !== root && !filePath.startsWith(`${root}/`)) {
      response.writeHead(403).end();
      return;
    }

    try {
      const body = await readFile(filePath);
      const contentType = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "text/javascript",
        ".json": "application/json",
        ".mp4": "video/mp4",
        ".otf": "font/otf",
        ".png": "image/png",
        ".webp": "image/webp",
        ".woff2": "font/woff2",
      }[extname(filePath)] ?? "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });

  await new Promise(resolveServer => server.listen(0, "127.0.0.1", resolveServer));
  const { port } = server.address();
  pageUrl = `http://127.0.0.1:${port}/himart-optimized-test.html`;
});

test.afterAll(async () => {
  await new Promise(resolveServer => server.close(resolveServer));
});

test("captures the fully revealed static Himart candidate", async ({ page }) => {
  const runtimeErrors = [];
  const failedResponses = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("response", response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await mkdir(artifactDir, { recursive: true });

  for (const [name, viewport] of [["desktop", { width: 1302, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    await page.goto(pageUrl, { waitUntil: "load" });
    await page.waitForTimeout(350);
    await revealEntirePage(page);

    await expect(page.locator(".hm-section-title").allTextContents()).resolves.toEqual(expect.arrayContaining(titles));
    await page.screenshot({ path: join(artifactDir, `himart-${name}.png`), fullPage: true });
  }

  expect(runtimeErrors).toEqual([]);
  expect(failedResponses).toEqual([]);
});
