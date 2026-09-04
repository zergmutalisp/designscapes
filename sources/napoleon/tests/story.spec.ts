import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const chapters = [
  "opening",
  "rise",
  "power",
  "campaigns",
  "cost",
  "russia",
  "fall",
  "legacy",
];
test("complete story, chronology, sources and assets", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("NapoleonBonaparte");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator(".hero img")
      .evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
  ).toBe(true);
  const dates = await page.locator(".life-timeline time").allTextContents();
  expect(dates).toEqual([
    "1769",
    "1789",
    "1799",
    "1804",
    "1812",
    "1815",
    "1821",
  ]);
  for (const id of chapters) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h1,#${id} h2`)).toBeVisible();
  }
  expect(
    await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .filter(
            (a) => !document.getElementById(a.getAttribute("href")!.slice(1)),
          )
          .map((a) => a.outerHTML),
      ),
  ).toEqual([]);
  await page.goto("/#source-5");
  await expect(page.locator("#sources>details")).toHaveAttribute("open", "");
  await expect(page.locator("#source-5")).toContainText("Civil Code");
  expect(
    await page.locator(".progress-track").getAttribute("aria-valuenow"),
  ).not.toBe("0");
  expect(errors).toEqual([]);
});
test("contents supports keyboard, closes, and moves focus to chapter", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".contents-trigger").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".contents-trigger")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".contents-trigger")).toBeFocused();
  await page.locator(".contents-trigger").click();
  await page.locator('#contents-dialog a[href="#russia"]').click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#russia")).toBeFocused();
  await expect(page).toHaveURL(/#russia$/);
  await page.screenshot({ path: "work/qa/desktop-russia.png" });
});
test("all campaign and legacy selections have complete, accessible states", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let i = 0; i < 8; i++) {
    const b = page.locator(`[data-campaign="${i}"]`);
    await b.click();
    await expect(b).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('[data-campaign][aria-pressed="true"]'),
    ).toHaveCount(1);
    await expect(page.locator("#campaign-description h3")).not.toBeEmpty();
    expect(
      await page
        .locator("#campaign-map path")
        .evaluateAll((ps) =>
          ps.every((p) => !(p.getAttribute("d") || "").includes("NaN")),
        ),
    ).toBe(true);
    await expect(page.locator("#campaign-map .map-place")).not.toHaveCount(0);
  }
  for (let i = 0; i < 7; i++) {
    const b = page.locator(`[data-legacy="${i}"]`);
    await b.click();
    await expect(b).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#legacy-detail .legacy-body")).not.toBeEmpty();
    await expect(page.locator("#legacy-detail .legacy-tension")).toContainText(
      "THE COMPLICATION",
    );
  }
  await page.locator(".legacy-transcript summary").click();
  await expect(page.locator(".legacy-transcript article")).toHaveCount(7);
});
test("responsive reading and no horizontal overflow", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const id of chapters) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px / ${id}`,
      ).toBe(true);
    }
    if (width === 390 || width === 1440) {
      await page.goto("/");
      await expect(page.locator(".hero-eyebrow")).toHaveCSS("opacity", "1");
      await page.screenshot({
        path: `work/qa/${width}-full.png`,
        fullPage: true,
      });
      for (const id of [
        "rise",
        "power",
        "campaigns",
        "russia",
        "fall",
        "legacy",
      ]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.screenshot({ path: `work/qa/${width}-${id}.png` });
      }
    }
  }
});
test("reduced motion preserves content and disables automatic staging", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
  ).toBe("auto");
  expect(
    await page
      .locator(".hero h1")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".atlas")
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("static");
  await page.locator('[data-campaign="0"]').click();
  await page.locator('[data-step="5"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-campaign="0"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({ path: "work/qa/reduced-motion.png" });
});
test("WCAG AA checks across reading and modal states", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-eyebrow")).toHaveCSS("opacity", "1");
  const read = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(read.violations).toEqual([]);
  await page.locator(".contents-trigger").click();
  const modal = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(modal.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#legacy");
  const mobile = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mobile.violations).toEqual([]);
});
test("campaign labels stay inside the frame and sticky stages fit short desktops", async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (let i = 0; i < 8; i++) {
      await page.locator(`[data-campaign="${i}"]`).click();
      const clipped = await page
        .locator("#campaign-map svg")
        .evaluate((svg) => {
          const view = (svg as unknown as SVGSVGElement).viewBox.baseVal;
          return [...svg.querySelectorAll(".map-place text")]
            .filter((t) => {
              const b = (t as SVGGraphicsElement).getBBox();
              return (
                b.x < 0 ||
                b.y < 0 ||
                b.x + b.width > view.width ||
                b.y + b.height > view.height
              );
            })
            .map((t) => t.textContent);
        });
      expect(clipped, `${width}px campaign ${i}`).toEqual([]);
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.locator('[data-step="3"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-campaign="3"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const bounds = await page.locator(".atlas").boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(82);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(720);
});
