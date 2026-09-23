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
