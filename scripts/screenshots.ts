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
  readonly out: string;
}

const base = process.env["SITE_URL"] ?? "http://127.0.0.1:4321";

const shots: readonly Shot[] = [
  // Cover of the site's own project card: the first screen in dark theme, 16:10.
  {
    path: "/",
    width: 1280,
    height: 800,
    theme: "dark",
    scale: 2,
    out: "src/assets/projects/zxxdev-github-io.png",
  },
  // README: the home page in both themes, and on a phone.
  { path: "/", width: 1280, height: 800, theme: "dark", scale: 1, out: "docs/images/home-dark.png" },
  {
    path: "/",
    width: 1280,
    height: 800,
    theme: "light",
    scale: 1,
    out: "docs/images/home-light.png",
  },
  { path: "/", width: 390, height: 844, theme: "dark", scale: 2, out: "docs/images/home-mobile.png" },
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
    await page.goto(new URL(shot.path, base).href, { waitUntil: "networkidle" });
    // Wait for the web fonts, or the text is drawn in a fallback font.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await mkdir(dirname(shot.out), { recursive: true });
    await page.screenshot({ path: shot.out });
    await page.close();
    console.log(`${shot.out}  ${String(shot.width)}x${String(shot.height)} ${shot.theme}`);
  }
} finally {
  await browser.close();
}
