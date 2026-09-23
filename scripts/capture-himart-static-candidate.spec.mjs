import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = resolve(root, process.env.HIMART_ARTIFACT_DIR ?? "artifacts");
const liveUrl = "https://shindongsik.com/himart.html";
const sectionIds = ["brand", "data", "journey", "direction"];
let server;
let pageUrl;
const titles = [
  "왜 고객들이 하이마트를 선택하지 않는지부터 확인했습니다.",
  "그리고 실제로 고객들이 서비스를 어떻게 이용하고 있는지도 살펴봤습니다.",
  "앞선 데이터를 바탕으로, 구매 여정의 흐름과 각 화면의 역할을 다시 정의했습니다.",
  "정의한 흐름과 여정별 정의를 바탕으로 빠르게 프로토타입을 만들고, 검증을 반복하고 있습니다.",
];

// The production page needs time to complete its legacy content runtime before capture.
test.setTimeout(180_000);

async function revealEntirePage(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.min(80, Math.max(12, Math.ceil(pageHeight / Math.max(viewportHeight, 1))));

  for (let step = 0; step <= steps; step += 1) {
    await page.evaluate(({ step, steps, pageHeight }) => window.scrollTo(0, Math.round((pageHeight * step) / steps)), { step, steps, pageHeight });
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

async function capturePage(page, { name, url, viewport, waitForRuntime }) {
  const audit = { name, url, viewport, runtimeErrors: [], failedResponses: [] };
  const recordPageError = error => audit.runtimeErrors.push(error.message);
  const recordConsoleError = message => {
    if (message.type() === "error") audit.runtimeErrors.push(message.text());
  };
  const recordFailedResponse = response => {
    if (response.status() >= 400) audit.failedResponses.push(`${response.status()} ${response.url()}`);
  };

  page.on("pageerror", recordPageError);
  page.on("console", recordConsoleError);
  page.on("response", recordFailedResponse);
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(waitForRuntime);
  await revealEntirePage(page);
  audit.state = await page.evaluate(sectionIds => ({
    pageHeight: document.documentElement.scrollHeight,
    titles: [...document.querySelectorAll(".hm-section-title")].map(node => node.textContent.trim()),
    hiddenRevealTargets: [...document.querySelectorAll(".hm-reveal, .title-rise-target")].filter(node => {
      const style = getComputedStyle(node);
      return style.visibility === "hidden" || Number(style.opacity) < 0.01;
    }).map(node => ({
      tag: node.tagName,
      id: node.id || null,
      className: node.className,
      text: node.textContent.trim().slice(0, 100),
    })),
    displayNoneRevealTargets: [...document.querySelectorAll(".hm-reveal, .title-rise-target")].filter(node => getComputedStyle(node).display === "none").map(node => ({
      tag: node.tagName,
      id: node.id || null,
      className: node.className,
      text: node.textContent.trim().slice(0, 100),
    })),
    flowMetrics: (() => {
      const block = document.querySelector("#journey .journey-flow-block");
      const row = block?.querySelector(".flow-row");
      const group = block?.querySelector(".flow-group");
      const cluster = block?.querySelector(".wide-flow-cluster-inner");
      const node = block?.querySelector(".flow-node");
      const read = element => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          className: element.className,
          rect: {
            top: Math.round(rect.top + window.scrollY),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          display: style.display,
          width: style.width,
          maxWidth: style.maxWidth,
          height: style.height,
          maxHeight: style.maxHeight,
          gap: style.gap,
          gridTemplateColumns: style.gridTemplateColumns,
          flexBasis: style.flexBasis,
          padding: style.padding,
          inlineStyle: element.getAttribute("style"),
          customProperties: {
            hmHjNodeSize: style.getPropertyValue("--hm-hj-node-size").trim(),
            hmJourneyGap: style.getPropertyValue("--hm-journey-gap").trim(),
            hmJourneyNodePad: style.getPropertyValue("--hm-journey-node-pad").trim(),
          },
        };
      };
      return { block: read(block), group: read(group), row: read(row), cluster: read(cluster), node: read(node) };
    })(),
    sections: sectionIds.map(id => {
      const section = document.getElementById(id);
      const head = section?.querySelector(":scope .hm-section-head");
      const rail = section?.querySelector(":scope .hm-wide-right-rail");
      const sectionRect = section?.getBoundingClientRect();
      const headRect = head?.getBoundingClientRect();
      const railRect = rail?.getBoundingClientRect();
      return {
        id,
        exists: Boolean(section),
        title: head?.querySelector(".hm-section-title")?.textContent.trim() ?? null,
        headCount: section ? section.querySelectorAll(":scope .hm-section-head").length : 0,
        railCount: section ? section.querySelectorAll(":scope .hm-wide-right-rail").length : 0,
        top: sectionRect ? Math.round(sectionRect.top + window.scrollY) : null,
        height: sectionRect ? Math.round(sectionRect.height) : null,
        headTop: headRect ? Math.round(headRect.top + window.scrollY) : null,
        railTop: railRect ? Math.round(railRect.top + window.scrollY) : null,
        railChildren: rail ? [...rail.children].map(node => ({
          tag: node.tagName,
          className: node.className,
          top: Math.round(node.getBoundingClientRect().top + window.scrollY),
          height: Math.round(node.getBoundingClientRect().height),
        })) : [],
        flowNodes: id === "journey" ? [...section.querySelectorAll(".journey-flow-block .flow-node")].map(node => ({
          className: node.className,
          display: getComputedStyle(node).display,
          top: Math.round(node.getBoundingClientRect().top + window.scrollY),
          height: Math.round(node.getBoundingClientRect().height),
          width: Math.round(node.getBoundingClientRect().width),
        })) : [],
      };
    }),
  }), sectionIds);
  await page.screenshot({ path: join(artifactDir, `himart-${name}.png`), fullPage: true });
  audit.sectionScreenshots = [];
  for (const id of sectionIds) {
    await page.evaluate(sectionId => document.getElementById(sectionId)?.scrollIntoView({ block: "start", behavior: "auto" }), id);
    // Allow the candidate's title-rise transition to finish before comparing the visible frame.\n    await page.waitForTimeout(1200);
    const screenshotName = `himart-${name}-${id}.png`;
    await page.screenshot({ path: join(artifactDir, screenshotName), fullPage: false });
    audit.sectionScreenshots.push(screenshotName);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  page.off("pageerror", recordPageError);
  page.off("console", recordConsoleError);
  page.off("response", recordFailedResponse);
  return audit;
}

function layoutComparison(candidate, live) {
  const ratio = (value, total) => value === null ? null : Number((value / total).toFixed(4));
  return candidate.state.sections.map((section, index) => {
    const reference = live.state.sections[index];
    return {
      id: section.id,
      titleMatches: section.title === reference.title,
      headCountMatches: section.headCount === reference.headCount,
      railCountMatches: section.railCount === reference.railCount,
      candidateTopRatio: ratio(section.top, candidate.state.pageHeight),
      liveTopRatio: ratio(reference.top, live.state.pageHeight),
      candidateHeightRatio: ratio(section.height, candidate.state.pageHeight),
      liveHeightRatio: ratio(reference.height, live.state.pageHeight),
    };
  });
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
  await mkdir(artifactDir, { recursive: true });
  const comparison = [];

  for (const [name, viewport] of [["desktop", { width: 1302, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const candidate = await capturePage(page, { name: `candidate-${name}`, url: pageUrl, viewport, waitForRuntime: 350 });
    const live = await capturePage(page, { name: `live-${name}`, url: liveUrl, viewport, waitForRuntime: 20000 });

    console.log(`Static candidate hidden reveal targets (${name}): ${JSON.stringify(candidate.state.hiddenRevealTargets)}`);
    console.log(`Static candidate display-none reveal targets (${name}): ${JSON.stringify(candidate.state.displayNoneRevealTargets)}`);
    console.log(`Candidate section geometry (${name}): ${JSON.stringify(candidate.state.sections)}`);
    console.log(`Candidate flow metrics (${name}): ${JSON.stringify(candidate.state.flowMetrics)}`);
    console.log(`Live flow metrics (${name}): ${JSON.stringify(live.state.flowMetrics)}`);
    console.log(`Live section geometry (${name}): ${JSON.stringify(live.state.sections)}`);
    expect(candidate.runtimeErrors).toEqual([]);
    expect(candidate.failedResponses).toEqual([]);
    expect(candidate.state.hiddenRevealTargets).toEqual([]);
    expect(candidate.state.titles).toEqual(expect.arrayContaining(titles));
    expect(live.state.titles).toEqual(expect.arrayContaining(titles));
    expect(candidate.state.sections.map(section => section.exists)).toEqual([true, true, true, true]);
    expect(live.state.sections.map(section => section.exists)).toEqual([true, true, true, true]);
    comparison.push({ viewport: name, candidate, live, sections: layoutComparison(candidate, live) });
  }

  await writeFile(join(artifactDir, "himart-live-candidate-comparison.json"), `${JSON.stringify(comparison, null, 2)}\n`);
});
