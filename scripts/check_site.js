// Open the site in Chromium, report console errors and failed requests,
// and save docs/screenshot.png (1200x900).
// Usage: node scripts/check_site.js [url]   (default http://localhost:8000/)
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const url = process.argv[2] || "http://localhost:8000/";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  // ERR_ABORTED = map tiles cancelled by MapLibre while zooming; not an error
  page.on("requestfailed", (r) => {
    const err = r.failure() && r.failure().errorText;
    if (err !== "net::ERR_ABORTED") problems.push(`failed: ${r.url()} ${err}`);
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__tokachi && window.__tokachi.map.loaded());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, "..", "docs", "screenshot-paper.png") });

  await page.click("#reveal");
  await page.waitForTimeout(4500);
  await page.check("#roads");
  await page.evaluate(() => {
    const m = window.__tokachi.map;
    const el = document.getElementById("blend");
    el.value = 55;
    el.dispatchEvent(new Event("input"));
    m.jumpTo({ center: [143.045, 42.83], zoom: 13.3 });
    document.getElementById("panel").scrollTop = 0;
  });
  await page.waitForTimeout(500);
  await page.mouse.click(820, 470);
  await page.evaluate(() => { document.getElementById("panel").scrollTop = 0; });
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => window.__tokachi.map.areTilesLoaded());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, "..", "docs", "screenshot.png") });

  await page.click("#lang");
  await page.waitForTimeout(300);
  const ja = await page.textContent("h1");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", (e) => problems.push(`mobile pageerror: ${e.message}`));
  await mobile.goto(url, { waitUntil: "networkidle" });
  await mobile.click("#reveal");
  await mobile.waitForTimeout(4500);
  await mobile.screenshot({ path: path.join(__dirname, "..", "docs", "screenshot-mobile.png") });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  console.log("info:", await page.textContent("#info"));
  console.log("ja title:", ja, "| mobile horizontal overflow:", overflow);
  console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "No console errors or failed requests.");
  await browser.close();
  process.exit(problems.length ? 1 : 0);
})();
