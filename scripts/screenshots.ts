/**
 * Takes the site's screenshots with a real browser, so they can be remade
 * whenever the design changes and never show anything from a desktop: only the
 * page itself is captured, never a browser window.
 *
 * It does not build or serve the site. Build it and start the preview first:
 *
 *   pnpm build && pnpm preview --host 127.0.0.1 --port 4321
 *   pnpm screenshots
 *
 * SITE_URL changes the address (default http://127.0.0.1:4321).
 * Node runs this TypeScript file directly (type stripping), with no build step.
 */
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";

interface Shot {
  /** Path on the site. */
  readonly path: string;
  readonly width: number;
  readonly height: number;
  readonly theme: "light" | "dark";
  /** 2 for a sharp image that Astro scales down; 1 for files shown as they are. */
  readonly scale: 1 | 2;
  /** Part of the page to keep, in CSS pixels. Without it, the whole viewport. */
  readonly clip?: { x: number; y: number; width: number; height: number };
  /** With a crop: what must fit entirely inside it (CSS selectors), or the script fails. */
  readonly keep?: readonly string[];
  readonly out: string;
}

const base = process.env["SITE_URL"] ?? "http://127.0.0.1:4321";

const shots: readonly Shot[] = [
  // Cover of the site's own project card, in dark theme and 16:10. Only the
  // introduction (below the header, above "Projects"): with the project cards in
  // it, the cover would show the card inside itself.
  {
    path: "/",
    width: 1280,
    height: 800,
    theme: "dark",
    scale: 2,
    clip: { x: 128, y: 66, width: 765, height: 478 },
    // The headline and the last button (top and bottom right of the introduction).
    keep: [
      "main > section:first-child h1",
      "main > section:first-child > div:last-child > a:last-child",
    ],
    out: "src/assets/projects/zxxdev-github-io.png",
  },
  // README: the home page in both themes, and on a phone.
  {
    path: "/",
    width: 1280,
    height: 800,
    theme: "dark",
    scale: 1,
    out: "docs/images/home-dark.png",
  },
  {
    path: "/",
    width: 1280,
    height: 800,
    theme: "light",
    scale: 1,
    out: "docs/images/home-light.png",
  },
  {
    path: "/",
    width: 390,
    height: 844,
    theme: "dark",
    scale: 2,
    out: "docs/images/home-mobile.png",
  },
];

const browser = await chromium.launch();
try {
  for (const shot of shots) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: shot.scale,
      colorScheme: shot.theme,
      reducedMotion: "reduce",
    });
    const url = new URL(shot.path, base).href;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    // A 404 or an error page would be saved as if it were the site.
    if (!response?.ok()) {
      throw new Error(`${url} answered ${String(response?.status() ?? "nothing")}`);
    }
    // Wait for the web fonts, or the text is drawn in a fallback font. Fail if the main one is missing.
    const fontLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Geist Variable"');
    });
    if (!fontLoaded) throw new Error(`${url}: the Geist font did not load`);
    // A fixed crop silently cuts the wrong area if the layout moves: check what it must hold.
    if (shot.clip && shot.keep) {
      const { x, y, width, height } = shot.clip;
      for (const selector of shot.keep) {
        const box = await page.locator(selector).first().boundingBox();
        const inside =
          box !== null &&
          box.x >= x &&
          box.y >= y &&
          box.x + box.width <= x + width &&
          box.y + box.height <= y + height;
        if (!inside) throw new Error(`${shot.out}: "${selector}" is not fully inside the crop`);
      }
    }
    await mkdir(dirname(shot.out), { recursive: true });
    await page.screenshot(shot.clip ? { path: shot.out, clip: shot.clip } : { path: shot.out });
    await page.close();
    console.log(`${shot.out}  ${String(shot.width)}x${String(shot.height)} ${shot.theme}`);
  }
} finally {
  await browser.close();
}
