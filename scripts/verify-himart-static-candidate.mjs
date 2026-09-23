import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidatePath = resolve(root, process.argv[2] ?? "himart-optimized-test.html");
const contractPath = resolve(root, process.argv[3] ?? "design-system/pages/himart-live-dom-contract.json");
const reportPath = process.argv[4] ? resolve(root, process.argv[4]) : null;

const forbiddenRuntimeWriters = [
  "content-runtime.js",
  "test-content-loader.js",
  "himart-narrative-v2-production-base.js",
  "test-content-final.js",
  "himart-wide-editorial-adapter.js",
];

const count = (text, fragment) => text.split(fragment).length - 1;
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const [html, contractText] = await Promise.all([
  readFile(candidatePath, "utf8"),
  readFile(contractPath, "utf8"),
]);
const contract = JSON.parse(contractText);

assert(/<(?:html|body)[^>]*\bhm-static-candidate\b/i.test(html), "Missing hm-static-candidate document marker.");

for (const writer of forbiddenRuntimeWriters) {
  assert(!html.includes(writer), `Forbidden runtime content writer is present: ${writer}`);
}

for (const section of contract.sections) {
  const start = html.search(new RegExp(`<section[^>]+\\bid=["']${section.id}["']`, "i"));
  assert(start !== -1, `Missing chapter section: #${section.id}`);
  if (start === -1) continue;

  const nextStart = html.indexOf("<section", start + 1);
  const chapter = html.slice(start, nextStart === -1 ? html.length : nextStart);
  assert(chapter.includes(section.title), `Chapter title differs: #${section.id}`);
  assert(count(chapter, "hm-section-head") === 1, `Expected one hm-section-head in #${section.id}.`);
  assert(count(chapter, "hm-wide-right-rail") === 1, `Expected one hm-wide-right-rail in #${section.id}.`);
  assert(chapter.indexOf("hm-section-head") < chapter.indexOf("hm-wide-right-rail"), `Head/rail order differs in #${section.id}.`);
}

const report = {
  candidate: candidatePath.replace(`${root}/`, ""),
  contract: contractPath.replace(`${root}/`, ""),
  sourceSha256: createHash("sha256").update(html).digest("hex"),
  sectionCount: contract.sections.length,
  forbiddenRuntimeWriters,
  passed: failures.length === 0,
  failures,
};

if (reportPath) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (failures.length) {
  console.error("Himart static candidate contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Himart static candidate contract passed (${report.sectionCount} chapters, ${report.sourceSha256.slice(0, 12)}).`);
}
